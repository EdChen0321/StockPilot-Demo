"""Package the sibling StockPilot workspace as a static GitHub Pages application."""

import argparse
import re
import shutil
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


BUILD = Path(__file__).resolve().parent
DEMO = BUILD.parent
PORTFOLIO_JS = {'portfolio.js', 'order-detail.js', 'dashboard.js', 'pickup-ui.js', 'kol-management.js'}


def write_text(path, content):
    clean = '\n'.join(line.rstrip() for line in content.splitlines()).rstrip() + '\n'
    path.write_text(clean, encoding='utf-8')


def export(source, prefix):
    warehouse = source / '倉管系統'
    operations = source / '營運系統'
    sys.path.insert(0, str(warehouse))
    from portfolio.server import role_page, workspace_page

    destination = DEMO / 'interactive'
    runtime = destination / 'runtime'
    assets = destination / 'assets'
    static = destination / 'static'
    for directory in (runtime, assets, static):
        directory.mkdir(parents=True, exist_ok=True)

    for filename in ('client.js', 'worker.js'):
        shutil.copyfile(BUILD / filename, runtime / filename)
    with ZipFile(runtime / 'python.zip', 'w', ZIP_DEFLATED) as archive:
        for project, key in ((warehouse, 'warehouse'), (operations, '營運系統')):
            for file in sorted((project / 'ops').rglob('*.py')):
                archive.write(file, Path(key) / file.relative_to(project))
        for file in sorted((warehouse / 'portfolio').glob('*.py')):
            if file.name not in {'scale_fixture.py', 'scale_benchmark.py', 'pickup_demo.py', 'restore_showcase.py', 'showcase_audit.py'}:
                archive.write(file, Path('warehouse/portfolio') / file.name)
        archive.write(BUILD / 'browser_runtime.py', 'browser_runtime.py')

    for name in ('lake-hero.png', 'swimbait.webp', 'frog.webp', 'worm.webp',
                 'swimbait-detail.webp', 'frog-detail.webp', 'worm-detail.webp'):
        shutil.copyfile(warehouse / 'portfolio/assets' / name, assets / name)

    for directory, name in ((warehouse / 'portfolio', 'portfolio'), (warehouse / 'web', 'warehouse'), (operations / 'web', 'operations')):
        target = static / name
        target.mkdir(exist_ok=True)
        for file in sorted(directory.iterdir()):
            if file.suffix not in {'.css', '.js'}:
                continue
            content = file.read_text(encoding='utf-8')
            content = content.replace('/assets/', prefix + 'assets/').replace('/vendor/', prefix + 'vendor/')
            if name == 'portfolio' and file.name in PORTFOLIO_JS:
                content = re.sub(r'\blocation\.(pathname|search|hash|origin|href)\b', r'demoLocation.\1', content)
                content = content.replace('history.replaceState(', 'demoHistory.replaceState(')
            write_text(target / file.name, content)

    vendor = destination / 'vendor/echarts-6.1.0'
    vendor.mkdir(parents=True, exist_ok=True)
    for name in ('echarts.min.js', 'LICENSE', 'NOTICE'):
        shutil.copyfile(warehouse / 'web/vendor/echarts-6.1.0' / name, vendor / name)

    args = (prefix + 'warehouse/', prefix + 'store/', prefix + 'operations/', prefix + 'kol-workspace/')
    pages = [
        ('shop', path, 'store/' + path.strip('/'), role_page('shop', path, *args), 'portfolio')
        for path in ('/', '/shop', '/cart', '/checkout', '/confirmation',
                     '/product/TIDE-SWIMBAIT', '/product/TIDE-FROG', '/product/TIDE-WORM')
    ]
    pages += [
        ('sales', path, 'operations/' + suffix, role_page('sales', path, *args), 'portfolio')
        for path, suffix in (('/', ''), ('/orders', 'orders'), ('/orders/detail', 'order'),
                             ('/pickups', 'pickups'), ('/sales', 'sales'), ('/kol', 'kol'))
    ]
    pages += [
        ('fulfillment', '/warehouse-workspace', 'warehouse', workspace_page(warehouse, 'fulfillment', *args), 'warehouse'),
        ('kol', '/', 'kol-workspace', workspace_page(operations, 'sales', *args), 'operations'),
    ]
    portfolio_files = {p.name for p in (static / 'portfolio').iterdir()}
    for role, path, folder, document, family in pages:
        html = document.decode()

        def static_url(match):
            attribute, name = match.groups()
            if name.startswith(('assets/', 'vendor/')):
                return f'{attribute}="{prefix}{name}'
            group = 'portfolio' if name in portfolio_files else family
            return f'{attribute}="{prefix}static/{group}/{name}'

        html = re.sub(r'(src|href)="/([^"?\s]+\.(?:js|css|png|webp))(?=["?])', static_url, html)
        if 'rel="icon"' not in html:
            html = html.replace('</head>', f'<link rel="icon" href="{prefix}assets/swimbait.webp"></head>', 1)
        html = html.replace('<head>', '<head>\n  <meta name="referrer" content="no-referrer">\n'
                            '<script>if(window.top===window){location.replace('
                            f'"/StockPilot-Demo/?view="+encodeURIComponent(location.pathname+location.search+location.hash)'
                            ');}</script>\n'
                            f'  <script src="{prefix}runtime/client.js" defer></script>\n'
                            f'  <link rel="stylesheet" href="{prefix}runtime/demo.css">', 1)
        html = re.sub(r'<body\b', f'<body data-demo-role="{role}" data-demo-path="{path}"', html, count=1)
        if role == 'shop':
            html = html.replace('Demonstration store · No real payments or deliveries',
                                'Demonstration store · Use fictional details · No payments or deliveries')
        bar = ('<div class="pages-demo-bar" aria-label="展示入口">'
               f'<a href="{prefix}store/">購物前台</a>'
               f'<a href="{prefix}operations/">營運</a>'
               f'<a href="{prefix}warehouse/#shipping">倉管出貨</a>'
               '<span data-demo-status role="status">正在載入展示資料…</span></div>')
        html = html.replace('</body>', bar + '</body>', 1)
        page = destination / folder / 'index.html'
        page.parent.mkdir(parents=True, exist_ok=True)
        write_text(page, html)
    shutil.copyfile(BUILD / 'demo.css', runtime / 'demo.css')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=DEMO.parent)
    parser.add_argument('--prefix', default='/StockPilot-Demo/interactive/')
    options = parser.parse_args()
    export(options.source.resolve(), options.prefix)
