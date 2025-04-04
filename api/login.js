// api/login.js
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

module.exports = (req, res) => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  res.redirect(authUrl);
};
