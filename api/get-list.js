// api/get-list.js
const { google } = require("googleapis");

module.exports = async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const spreadsheetId = "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI";
  const sheetName = "list"; // リストが保存されているシート名
  const range = `${sheetName}!A:A`; // A列からリストを取得

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const items = response.data.values
      ? response.data.values.map((row) => row[0])
      : [];

    res.json({
      status: "success",
      items,
    });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
