// api/add-question.js
const { google } = require("googleapis");

module.exports = async (req, res) => {
  const { name, contactNeeded, email, question } = req.body;

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
  const sheetName = "question";
  const range = `${sheetName}!A:D`;

  // デフォルト値を設定
  const defaultName = name || "匿名";
  const defaultContactNeeded = contactNeeded || "不要";
  const defaultEmail = email || "なし";
  const defaultQuestion = question || "未入力";

  const values = [
    [
      defaultName,
      defaultContactNeeded,
      defaultEmail,
      defaultQuestion,
      new Date().toISOString(),
    ],
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.json({ status: "success", message: "お問い合わせを記録しました！" });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
