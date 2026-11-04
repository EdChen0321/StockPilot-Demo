# StockPilot 互動情境 Demo

這是 [StockPilot 倉管系統](https://github.com/EdChen0321/StockPilot-Warehouse)與 [StockPilot 營運系統](https://github.com/EdChen0321/StockPilot-Operations)的獨立作品展示頁。訪客選擇工作視角，回答例外情境，再閱讀判斷依據與專案操作指南。

## 展示範圍

- 情境以公開操作規則為依據，由預設的刁鑽條件組合而成；數量與選項順序會在瀏覽器內變動。
- 這是靜態互動情境，不連接兩個專案的 Python API、SQLite 資料庫或 AI 助理。
- 倉管與營運系統各自獨立。這個展示頁不暗示兩套資料已串接，也不代表原專案已完成瀏覽器端全面驗收。
- 網站沒有收集輸入、帳號或分析資料；所有範例數據都只存在於訪客當前頁面。

## 內容依據

- [倉管：庫存與出貨指南](https://github.com/EdChen0321/StockPilot-Warehouse/blob/main/docs/inventory-shipping.md)
- [營運：訂單與銷售指南](https://github.com/EdChen0321/StockPilot-Operations/blob/main/docs/orders-sales.md)
- [營運：KOL 分析指南](https://github.com/EdChen0321/StockPilot-Operations/blob/main/docs/kol-analysis.md)

## 本機預覽

在此目錄執行 `python -m http.server 8000`，開啟 `http://127.0.0.1:8000/`。網站只有靜態 HTML、CSS 與 JavaScript，不需要安裝套件。

## 授權

本站程式碼採用 [MIT License](LICENSE)。兩個產品專案各有自己的授權與狀態說明。
