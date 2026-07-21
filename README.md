# 雙發 ERP 7.0

雙發水電五金材料行專用 ERP / POS 系統。

## 目前版本

**7.0.0 Alpha 1**  
製作日期：2026-07-21

這一版先保留目前可用的 POS 與商品資料，並開始接軌舊系統的 Visual FoxPro DBF 資料庫。

## 本版完成

- 保留 POS 收銀與商品搜尋
- 支援 8 碼商品編號
- 支援國際條碼與店內自編條碼
- 支援產品型號
- 支援英文注音頭碼，例如 BGF、GXW
- 新增「7.0資料庫」頁面
- 建立 DBF 資料表欄位與筆數清單
- 已辨識 XG_CUS.DBF 客戶主檔
- 已辨識 XG_INOT.DBF 庫存異動紀錄
- 新增 README 與 CHANGELOG

## 已辨識資料

- XG_CUS.DBF：客戶主檔，5,304 筆
- XG_INOT.DBF：庫存異動，322,080 筆
- XG_MEN.DBF：員工資料
- XG_ACCDEP.DBF：會計科目
- 其他 BOM、收付款、價格異動資料表

詳細欄位請看 `data/dbf_schema.json`。

## 尚未完成

- DBF 客戶資料直接匯入客戶頁
- DBF 庫存歷程查詢
- 商品主檔 DBF 確認
- 進貨、銷貨、退貨完整串接
- 多台電腦同步

## 部署

將 `index.html` 放在 GitHub Pages 專案根目錄。

## 安全原則

Alpha 階段不直接寫回舊 POS 的 DBF，避免損壞正式營業資料。先採唯讀匯入與比對。
