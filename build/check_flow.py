"""Check the browser-only storefront, operations and warehouse flow in Edge."""

import argparse
import functools
import threading
from time import perf_counter
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlsplit

from playwright.sync_api import expect, sync_playwright


def check(base):
    started = perf_counter()
    timings = {}
    def measured(label):
        nonlocal started
        timings[label] = round(perf_counter() - started, 3)
        print(label, timings[label], "seconds", flush=True)
        started = perf_counter()

    errors = []
    unexpected_api = []
    failed_assets = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel='msedge')
        context = browser.new_context(viewport={'width': 1366, 'height': 1000})
        context.on('request', lambda req: unexpected_api.append(req.url) if urlsplit(req.url).path.startswith('/api/') else None)
        context.on('response', lambda response: failed_assets.append(response.url)
                   if response.url.startswith(base) and response.status >= 400 else None)
        page = context.new_page()
        page.set_default_timeout(45_000)
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: print(message.text, flush=True) if message.type == 'error' else None)
        started = perf_counter()
        page.goto(urljoin(base, '../'))
        page = page.frames[1]
        expect(page.locator('.od-metrics')).to_be_visible(timeout=60000)
        measured('initial dashboard')
        page.goto(base + 'store/product/TIDE-FROG/?utm_medium=alex-tide')
        expect(page.get_by_role('heading', name='Floating frog lure')).to_be_visible(timeout=60_000)
        measured('product page')
        page.get_by_role('button', name='Add to bag').click()
        page.wait_for_url('**/store/cart/')
        expect(page.locator('#go-checkout')).to_be_visible()
        measured('cart')
        page.locator('#go-checkout').click()
        page.wait_for_url('**/store/checkout/')
        for key, value in {'name': '展示顧客', 'email': 'demo@example.invalid', 'recipient': '展示顧客', 'address': '虛構取貨門市'}.items():
            page.locator('#checkout-' + key).fill(value)
        started = perf_counter()
        page.locator('#checkout').click()
        page.wait_for_url('**/store/confirmation/?order=*')
        order = parse_qs(urlsplit(page.url).query)['order'][0]
        expect(page.locator('#receipt .status')).to_be_visible()
        measured('checkout saved')
        print('Checkout:', order, flush=True)

        page.get_by_role('link', name='營運', exact=True).click()
        expect(page.get_by_role('heading', name='營運狀況，一眼掌握。')).to_be_visible()
        measured('operations dashboard')
        page.get_by_role('link', name='顧客訂單', exact=True).click()
        page.locator('#customer-order-search').fill(order)
        row = page.locator('#customer-order-rows tr').filter(has_text=order[-8:])
        expect(row).to_contain_text('浮水青蛙餌')
        measured('orders and search')
        row.get_by_role('link', name='查看訂單', exact=False).click()
        expect(page.locator('#customer-order-detail')).to_contain_text('尚未建立出貨單')
        measured('order detail')
        page.get_by_role('link', name='建立出貨單', exact=False).click()
        expect(page.locator('#shipment-order-number')).to_have_value(order)
        measured('warehouse entry')
        page.locator('#shipment-form button[type=submit]').click()
        page.locator('#shipment-scan').fill('TIDE-FROG')
        page.locator('#shipment-scan').press('Enter')
        expect(page.get_by_role('button', name='完成', exact=True)).to_be_enabled()
        page.get_by_role('button', name='完成', exact=True).click()
        expect(page.locator('#shipment-detail')).to_contain_text('已核對 1 件 · 待核對 0 件')
        expect(page.locator('#shipment-detail').get_by_role('button', name='回到準備中')).to_be_visible()
        measured('create scan and ship')
        print('Shipment complete:', page.url, flush=True)

        page.goto(base + 'store/')
        page.locator('#track-order-id').fill(order)
        page.locator('#track-form button[type=submit]').click()
        expect(page.locator('#receipt .status')).to_have_text('Shipped')
        page.goto(page.url)
        page.locator('#track-order-id').fill(order)
        page.locator('#track-form button[type=submit]').click()
        expect(page.locator('#receipt .status')).to_have_text('Shipped')
        assert not unexpected_api, unexpected_api
        assert not failed_assets, failed_assets
        assert not errors, errors
        print('Storefront tracking confirms shipment after reload, with no network API calls.')
        print('TIMINGS', timings, flush=True)
        browser.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base')
    args = parser.parse_args()
    if args.base:
        check(args.base)
    else:
        root = Path(__file__).resolve().parents[2]
        class QuietHandler(SimpleHTTPRequestHandler):
            def log_message(self, *_):
                pass

        handler = functools.partial(QuietHandler, directory=root)
        with ThreadingHTTPServer(('127.0.0.1', 0), handler) as server:
            threading.Thread(target=server.serve_forever, daemon=True).start()
            try:
                check(f'http://127.0.0.1:{server.server_port}/StockPilot-Demo/interactive/')
            finally:
                server.shutdown()

