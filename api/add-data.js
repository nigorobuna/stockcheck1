const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const credentials = require("../credentials.json"); // OAuthクライアントの認証情報

const oauth2Client = new OAuth2Client(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

// 認証フローを開始する関数
async function authenticate(req, res) {
  const { tokens } = await oauth2Client.getToken(req.query.code); // コードを使用してトークンを取得
  oauth2Client.setCredentials(tokens); // トークンを設定
  // トークンを保存する処理
  res.redirect("/"); // 成功後にリダイレクトする場所
}

// スプレッドシートにアクセスする関数
async function getItemListFromSheet() {
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI",
    range: "list!A2:A", // 必要な範囲を指定
  });
  return res.data.values.map((row) => row[0]);
}

// POSTリクエストの処理（データ追加）
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

      const sheets = google.sheets({ version: "v4", auth: oauth2Client });
      await sheets.spreadsheets.values.append({
        spreadsheetId: "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI",
        range: "list!A2:D",
        valueInputOption: "RAW",
        resource: {
          values: [[reporter, usedDate, usedItem, quantity]],
        },
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
