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
