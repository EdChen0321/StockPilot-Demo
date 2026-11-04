# StockPilot 操作展示

這是 [StockPilot 倉管系統](https://github.com/EdChen0321/StockPilot-Warehouse)與 [StockPilot 營運系統](https://github.com/EdChen0321/StockPilot-Operations)的獨立、可操作展示網站。

## 可以操作的流程

- **倉管：** 查看庫存 → 建立並確認入庫單 → 配入符合條件的櫃位 → 建立出貨單 → 加入商品 → 配貨 → 完成出貨。
- **營運：** 建立或取消訂單 → 查詢有效銷售 → 核對 KOL 的 UTM 歸屬。

網站使用合成範例資料，包括未配櫃庫存、停用櫃位、取消訂單與缺少 UTM 的訂單。訪客可以自行操作、查看狀態和數字如何變化。操作狀態只存在該瀏覽器的 `localStorage`，可按「重設範例資料」清除。

## 展示邊界

GitHub Pages 無法執行原專案的 Python API 或 SQLite。此網站用瀏覽器程式重現上述主要作業的互動與規則，不會連接或修改任何原專案資料。兩個系統各自獨立，這裡也沒有建立跨系統同步。頁面未包含原專案的全部功能；實際功能、操作和限制以兩個專案的 README 及操作指南為準。

## 依據

- [倉管：庫存與出貨指南](https://github.com/EdChen0321/StockPilot-Warehouse/blob/main/docs/inventory-shipping.md)
- [營運：訂單與銷售指南](https://github.com/EdChen0321/StockPilot-Operations/blob/main/docs/orders-sales.md)
- [營運：KOL 分析指南](https://github.com/EdChen0321/StockPilot-Operations/blob/main/docs/kol-analysis.md)

## 本機預覽

在此目錄執行 `python -m http.server 8000`，開啟 `http://127.0.0.1:8000/`。無需安裝套件。

## 授權

本站程式碼採用 [MIT License](LICENSE)。兩個產品專案各有自己的授權與狀態說明。
