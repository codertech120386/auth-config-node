const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const readlineSync = require("readline-sync");

const {
  SCOPES,
  TOKEN_PATH,
  CLIENT_SECRET_PATH,
  PROJECT_ROOT
} = require("./config");

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
const storeToken = token => {
  try {
    fs.mkdirSync(PROJECT_ROOT);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
    if (err) throw err;
    console.log("Token stored to " + TOKEN_PATH);
  });
};

const getOauth2Client = () => {
  let credentials;
  try {
    credentials = fs.readFileSync(CLIENT_SECRET_PATH, "utf8");
  } catch (error) {
    console.log(error);
    console.log("File path not specified in config");
  }
  credentials = JSON.parse(credentials);
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  return oauth2Client;
};

const generateAuthToken = async () => {
  let authUrl, code, token;
  const oauth2Client = getOauth2Client();
  try {
    authUrl = await oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES
    });
  } catch (error) {
    console.log(error);
    return;
  }
  console.log("Authorize this app by visiting this URL: ", authUrl);
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  try {
    code = readlineSync.question("Enter the code from that page here: ");
  } catch (err) {
    console.log("Didn't enter the code");
    return;
  }
  console.log(code);
  try {
    const response = await oauth2Client.getToken(code);
    token = response.tokens;
  } catch (err) {
    console.log("Error getting token");
    return;
  }
  storeToken(token);
  return "Token generation successful";
};

generateAuthToken().then(function(message) {
  console.log(message);
});
