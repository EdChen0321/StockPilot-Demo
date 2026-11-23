# StockPilot 線上操作展示

[開啟 GitHub Pages](https://edchen0321.github.io/StockPilot-Demo/)

從 Tide & Tackle 商店建立模擬訂單，到營運查單，再到倉管建立出貨單、掃碼及完成出貨。返回購物前台即可查詢同一張訂單的出貨狀態。

展示沿用本機整合版的介面和庫存規則。Python 與 SQLite 在瀏覽器內執行，範例資料與試單紀錄保存在各瀏覽器的 IndexedDB。請使用虛構資料。付款和寄送均為模擬。初次使用會載入 Pyodide 及其套件。

## 更新展示

在本機整合版根目錄執行：

```sh
python StockPilot-Demo/build/export.py
python StockPilot-Demo/build/check_flow.py
```

匯出工具會從相鄰的倉管與營運原始碼重建 GitHub Pages 的 interactive 目錄。測試使用 Playwright 與 Microsoft Edge，以靜態 HTTP 服務確認下單、查單、掃碼出貨與重整後的資料讀取。

## 完整初始資料

2026-11-23 版本採用本機 scale-a 展示的 SQLite 備份，包含 365 款商品、5,005 張訂單、4,411 件庫存品項紀錄、7 張出貨單、13 張入庫單，以及完整的商品採購、物料、供應商、BOM、採購成本與工廠生產流程資料，保留包裹、退貨與異動關聯。數量快照位於 interactive/runtime/seed-manifest.json。

完整資料使用獨立 IndexedDB 資料區。此前的小型展示資料仍留在舊資料區。每位訪客的後續試單只保存於自己的瀏覽器。

重新匯出本機展示資料時執行 python StockPilot-Demo/build/export_data.py，再執行 export.py 和 check_flow.py。
