"""Export the explicitly selected synthetic main showcase using SQLite backups."""
from contextlib import closing
import json
import sqlite3
import tempfile
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[2]
source = root / '倉管系統/.local/scale-a-20261110'
output = root / 'StockPilot-Demo/interactive/runtime'
counts = {}
with tempfile.TemporaryDirectory() as temporary:
    with ZipFile(output / 'seed.zip', 'w', ZIP_DEFLATED, compresslevel=9) as archive:
        for name in ('warehouse', 'operations'):
            path = source / (name + '.sqlite3')
            target = Path(temporary) / path.name
            with closing(sqlite3.connect(path.as_uri() + '?mode=ro', uri=True)) as original:
                with closing(sqlite3.connect(target)) as backup:
                    original.backup(backup)
                    assert backup.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
                    counts[name] = {
                        table: backup.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
                        for table in ('products', 'current_orders', 'stock_units', 'shipments', 'receipts')
                    }
                    backup.execute('VACUUM')
            archive.write(target, target.name)
(output / 'seed-manifest.json').write_text(json.dumps(counts, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(counts))
