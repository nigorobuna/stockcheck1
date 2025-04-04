// api/add-order.js
const { google } = require("googleapis");

module.exports = async (req, res) => {
  const { reporter, usedDate, usedItem, quantity } = req.body;

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
  const sheetName = "order";
  const range = `${sheetName}!A:E`;

  const values = [
    [reporter, usedDate, usedItem, quantity, new Date().toISOString()],
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.json({
      status: "success",
      message: "データを `order` シートに追加しました！",
    });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
