const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../credentials.json"); // Google APIの認証情報を指定

// Google Sheets APIを利用してデータを読み込む関数
async function getItemListFromSheet() {
  const doc = new GoogleSpreadsheet(
    "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI"
  ); // シートIDを指定
  await doc.useServiceAccountAuth(creds); // 認証
  await doc.loadInfo(); // シートのメタデータをロード

  const sheet = doc.sheetsByIndex[0]; // シートのインデックスを指定（最初のシート）
  const rows = await sheet.getRows(); // 行データを取得
  return rows.map((row) => row["Item"]); // アイテムのリストを取得
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
    // POSTリクエストの処理（例: データ追加など）
    // 必要に応じてここに処理を追加します
  } else {
    res.status(405).json({ status: "error", message: "Method Not Allowed" });
  }
};
