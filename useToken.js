const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

import { TOKEN_PATH, CLIENT_SECRET_PATH, CHANNEL_ID } from "./config";

import credentials from "./client_secret.json";
import token from "./youtube-token.json";

const getOauth2Client = function() {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  oauth2Client.credentials = token;
  return oauth2Client;
};

const getChannelVideos = async function() {
  const auth = getOauth2Client();
  let response;
  const service = google.youtube("v3");
  try {
    response = await service.playlistItems.list({
      auth: auth,
      part: "contentDetails,id,snippet,status",
      playlistId: CHANNEL_ID,
      maxResults: "5"
    });
  } catch (error) {
    console.log(error);
    console.log("Some error occured while fetching");
  }
  const channels = response.data.items;
  if (channels.length == 0) {
    console.log("No channels found.");
  } else {
    return channels;
  }
};

module.exports = {
  getChannelVideos: getChannelVideos
};
