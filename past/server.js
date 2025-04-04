require("dotenv").config();
const express = require("express");
const open = require("open").default;
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
const port = 3000;

// OAuth2の設定
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// CORSの設定（フロントエンドとサーバーをつなげるため）
app.use(
  cors({
    origin: "https://stockcheck1.vercel.app", // フロントエンドのURLを許可
    methods: ["GET", "POST"], // GETとPOSTリクエストを許可
    allowedHeaders: ["Content-Type"], // JSONデータ送信を許可
  })
);

// **🚀 追加！JSONリクエストをパースする設定**
app.use(express.json());

// Googleログインページへリダイレクト
app.get("/login", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  res.redirect(authUrl);
});

// 必要なモジュールをインポート
const dotenv = require("dotenv");
dotenv.config(); // .env ファイルを読み込む

// 認証後の処理
app.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // .env ファイルにトークンを保存
    process.env.ACCESS_TOKEN = tokens.access_token;
    process.env.REFRESH_TOKEN = tokens.refresh_token;

    // .env ファイルを上書き保存するための処理
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
});

// サーバーを起動
app.listen(port, () => {
  console.log(`サーバー起動: http://localhost:${port}`);
  open(`http://localhost:${port}/login`);
});

// Google Sheets APIのセットアップ
const sheets = google.sheets({ version: "v4", auth: oauth2Client });

// **🔥 デバッグ用: 受信データを確認するミドルウェアk**
app.use((req, res, next) => {
  console.log("📩 受信データ:", req.body);
  next();
});

// 【リストの取得】`list` シートからデータを取得
app.get("/get-list", async (req, res) => {
  try {
    const spreadsheetId = "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI";
    const sheetName = "list";
    const range = `${sheetName}!A:A`; // A列のデータを取得

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // 取得したデータをレスポンスとして返す
    const items = response.data.values
      ? response.data.values.map((row) => row[0])
      : [];

    res.json({ status: "success", items });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 「その他」が選ばれたらテキスト入力を表示
function toggleOtherInput() {
  let usedItem = document.getElementById("usedItem");
  let otherItem = document.getElementById("otherItem");

  if (usedItem.value === "その他") {
    otherItem.classList.remove("hidden"); // クラスを削除 → 表示
    otherItem.required = true;
  } else {
    otherItem.classList.add("hidden"); // クラスを追加 → 非表示
    otherItem.required = false;
    otherItem.value = ""; // 入力欄をリセット
  }
}

// イベントリスナーを追加（プルダウン変更時）
//document.getElementById("usedItem").addEventListener("change", toggleOtherInput);

// 【使用した物の登録】データを `use` シートに追加
app.post("/add-data", async (req, res) => {
  try {
    const { reporter, usedDate, usedItem, quantity } = req.body;
    const spreadsheetId = "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI";
    const sheetName = "use";
    const range = `${sheetName}!A:E`;

    const values = [
      [reporter, usedDate, usedItem, quantity, new Date().toISOString()],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.json({
      status: "success",
      message: "データを `use` シートに追加しました！",
    });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 【リクエスト登録】データを `request` シートに追加
app.post("/add-request", async (req, res) => {
  try {
    const { reporter, item, quantity, reason } = req.body;
    const spreadsheetId = "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI";
    const sheetName = "request";
    const range = `${sheetName}!A:E`;

    const values = [
      [reporter, item, quantity, reason, new Date().toISOString()],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.json({
      status: "success",
      message: "データを `request` シートに追加しました！",
    });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 【お問い合わせ記録】データを `question` シートに追加
app.post("/add-question", async (req, res) => {
  try {
    const spreadsheetId = "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI";
    const sheetName = "question"; // `question` シートにデータを追加する
    const range = `${sheetName}!A:D`; // A:D列にデータを追加

    // 🔹 null の場合のデフォルト値を設定
    const name = req.body.name || "匿名";
    const contactNeeded = req.body.contactNeeded || "不要";
    const email = req.body.email || "なし";
    const question = req.body.question || "未入力";

    // スプレッドシートに追加するデータ
    const values = [
      [name, contactNeeded, email, question, new Date().toISOString()],
    ];

    // Google Sheets APIを使ってデータを追加
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
});

// 【使用した物の登録】データを `order` シートに追加
app.post("/add-order", async (req, res) => {
  try {
    const { reporter, usedDate, usedItem, quantity } = req.body;
    const spreadsheetId = "1T4JDxrcSAifPkNgnslUlh521IVEY571QswO34CPiyUI";
    const sheetName = "order";
    const range = `${sheetName}!A:E`;

    const values = [
      [reporter, usedDate, usedItem, quantity, new Date().toISOString()],
    ];

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
});
