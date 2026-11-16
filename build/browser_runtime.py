"""Run the StockPilot request handlers inside the browser without opening sockets."""

import base64
import json
import sqlite3
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import quote, urlsplit

from ops.server import HttpError
from ops.store import ConflictError, Store
from portfolio import server as showcase
from portfolio.pickup import Pickup


class BrowserRequest:
    def capture(self, context, target, method, body):
        self.server = context
        self.path = target
        self.command = method
        self.response = None
        parsed = urlsplit(target)
        try:
            if parsed.path.startswith('/api/assistant/'):
                raise HttpError(403, '瀏覽器展示未啟用 AI 助理')
            if method == 'GET':
                self.get(parsed.path, parsed.query)
            elif method == 'POST' and parsed.path.startswith('/api/') and isinstance(body, dict):
                self.send(self.post(parsed.path, body))
            else:
                raise HttpError(405, '此展示不支援這個操作')
        except HttpError as error:
            self.send({'error': error.message}, error.status)
        except ConflictError as error:
            self.send({'error': str(error)}, 409)
        except KeyError:
            self.send({'error': '找不到指定資料'}, 404)
        except PermissionError as error:
            self.send({'error': str(error)}, 403)
        except (TypeError, ValueError) as error:
            self.send({'error': str(error)}, 400)
        except sqlite3.Error:
            self.send({'error': '展示資料無法讀寫，請重新整理後再試'}, 503)
        return self.response

    def send(self, value, status=200, mime='application/json; charset=utf-8', filename=None):
        headers = {'Content-Type': mime}
        if filename:
            headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        if mime.startswith('application/json'):
            body = json.dumps(value, ensure_ascii=False)
            binary = False
        else:
            body = base64.b64encode(value.encode() if isinstance(value, str) else value).decode()
            binary = True
        self.response = dict(status=status, headers=headers, body=body, binary=binary)

    def send_response(self, status):
        self.response = dict(status=status, headers={}, body='', binary=False)

    def send_header(self, name, value):
        self.response['headers'][name] = value

    def end_headers(self):
        pass


class PortfolioRequest(BrowserRequest, showcase.PortfolioHandler):
    def __init__(self):
        pass


class Runtime:
    def __init__(self, directory, base):
        directory = Path(directory)
        directory.mkdir(parents=True, exist_ok=True)
        store = Store(directory / 'warehouse.sqlite3')
        demo = showcase.localize_warehouse(store, showcase.seed_warehouse(store))
        with store.connect() as db:
            db.execute('CREATE TABLE IF NOT EXISTS portfolio_checkouts(token TEXT PRIMARY KEY, cart TEXT NOT NULL, ordered_at TEXT NOT NULL)')
            db.execute('CREATE TABLE IF NOT EXISTS portfolio_notes(token TEXT PRIMARY KEY, order_id TEXT NOT NULL, body TEXT NOT NULL)')
            db.execute('CREATE TABLE IF NOT EXISTS portfolio_checkout_details(token TEXT PRIMARY KEY, details TEXT NOT NULL)')
        op_store, catalogue, orders, kol, operations_server = showcase.load_operations()
        kol_store = op_store.Store(directory / 'operations.sqlite3')
        kol_demo = showcase.seed_kol(kol_store, catalogue, orders, kol)
        showcase.extend_catalogue(store, demo, kol_store, catalogue, kol_demo)
        self.shared = dict(store=store, portfolio=demo, kol_store=kol_store, kol_module=kol,
                           kol_orders=orders, kol_portfolio=kol_demo,
                           pickup=Pickup(store, demo['account_id']),
                           allow_demo=False, kol_catalog=None,
                           shop_url=base + 'store/', sales_url=base + 'operations/',
                           fulfillment_url=base + 'warehouse/', kol_url=base + 'kol/')
        self.contexts = {
            role: SimpleNamespace(**self.shared, role=role)
            for role in ('shop', 'sales', 'fulfillment')
        }
        self.contexts['kol'] = SimpleNamespace(store=kol_store, role='sales', allow_demo=False, kol_catalog=None)

        class OperationsRequest(BrowserRequest, operations_server.Handler):
            def __init__(self):
                pass

        self.operations_request = OperationsRequest
    def request(self, role, target, method='GET', payload='null'):
        handler = self.operations_request() if role == 'kol' else PortfolioRequest()
        return json.dumps(handler.capture(self.contexts[role], target, method, json.loads(payload)), ensure_ascii=False)

    def shipment_route(self, order_id):
        handler = PortfolioRequest()
        handler.server = self.contexts['fulfillment']
        order = handler.order_detail(order_id)
        if order['shipment']:
            return 'shipping/' + quote(order['shipment']['id'], safe='')
        key = json.dumps([order['account_id'], order_id], ensure_ascii=False, separators=(',', ':'))
        return 'shipping/new/' + quote(key, safe='')
