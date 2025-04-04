// api/add-request.js
export default function handler(req, res) {
  if (req.method === "POST") {
    const { reporter, item, quantity, reason } = req.body;

    // ここでデータを処理します（例：データベースに保存）

    // 処理が成功した場合
    res.status(200).json({ status: "success" });
  } else {
    // GETリクエストなどが来た場合
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
