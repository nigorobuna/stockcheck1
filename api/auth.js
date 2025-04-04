const { google } = require("googleapis");

// Google OAuth2クライアントを作成
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI // Google Cloud Consoleで設定したリダイレクトURI
);

module.exports = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // 初回アクセス時にリフレッシュトークンを取得
    scope: ["https://www.googleapis.com/auth/spreadsheets.readonly"], // 必要なスコープを指定
  });

  res.redirect(authUrl); // ユーザーをGoogle認証ページにリダイレクト
};
