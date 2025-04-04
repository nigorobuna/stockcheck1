// api/callback.js
const { google } = require("googleapis");

module.exports = async (req, res) => {
  const { code } = req.query;
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // トークンを.envに保存
    process.env.ACCESS_TOKEN = tokens.access_token;
    process.env.REFRESH_TOKEN = tokens.refresh_token;

    // .envを更新する処理
    const fs = require("fs");
    const envPath = "./.env";
    const envContent = fs.readFileSync(envPath, "utf8");
    const newEnvContent = envContent
      .replace(/ACCESS_TOKEN=.*/g, `ACCESS_TOKEN=${tokens.access_token}`)
      .replace(/REFRESH_TOKEN=.*/g, `REFRESH_TOKEN=${tokens.refresh_token}`);

    fs.writeFileSync(envPath, newEnvContent);

    res.send("✅ 認証成功！トークンを取得しました！");
  } catch (error) {
    console.error("❌ 認証エラー:", error);
    res.status(500).send("認証に失敗しました");
  }
};
