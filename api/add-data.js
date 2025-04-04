const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../credentials.json"); // Google APIの認証情報を指定

// Google Sheets APIを利用してデータを読み込む関数
async function getItemListFromSheet() {
  const doc = new GoogleSpreadsheet(
    "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI"
  );
  await doc.useServiceAccountAuth(creds); // 認証
  await doc.loadInfo(); // シートのメタデータをロード

  const sheet = doc.sheetsByIndex["list"];
  const rows = await sheet.getRows();
  return rows.map((row) => row["Item"]);
}

// POSTリクエストを処理する
module.exports = async (req, res) => {
  if (req.method === "GET") {
    try {
      const items = await getItemListFromSheet();
      res.status(200).json({ status: "success", items });
    } catch (error) {
      console.error("データ取得エラー:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  } else if (req.method === "POST") {
    try {
      const { reporter, usedDate, usedItem, quantity } = req.body;

      const doc = new GoogleSpreadsheet(
        "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI"
      );
      await doc.useServiceAccountAuth(creds);
      await doc.loadInfo();

      const sheet = doc.sheetsByIndex[0];
      await sheet.addRow({
        Reporter: reporter,
        UsedDate: usedDate,
        UsedItem: usedItem,
        Quantity: quantity,
      });

      res
        .status(200)
        .json({ status: "success", message: "データが追加されました" });
    } catch (error) {
      console.error("データ追加エラー:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  } else {
    res.status(405).json({ status: "error", message: "Method Not Allowed" });
  }
};
