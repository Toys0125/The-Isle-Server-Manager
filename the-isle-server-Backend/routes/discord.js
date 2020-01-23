const express = require("express");
const app = express();
const router = express.Router();
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const shared = require("../functions/shared");

var apiKeys = null;

function loopAPI(key) {
  for (item in apiKeys) {
    if (item == key) {
      return 0;
    }
  }
  throw "Missing Key/No Match";
}

async function checkAPI(req) {
  var key = null;
  if (req.headers.authorization) {
    key = req.headers.authorization;
  } else {
    if (req.body.APIkey) {
      key = req.body.APIkey;
    } else {
      return -10;
    }
  }
  try {
    loopAPI(key);
    return 0;
  } catch (error) {
    console.error(error, key);
    return -50;
  }
}

router.use(function timeLog(req, res, next) {
  var date = new Date();
  var formattedTimer =
    "[" +
    (date.getMonth() + 1) +
    "/" +
    date.getDay() +
    "/" +
    date.getFullYear() +
    "] ";
  formattedTimer +=
    date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
  formattedTimer +=
    ":" +
    date.getMinutes() +
    ":" +
    (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds());
  console.log(formattedTimer, req.method, req.originalUrl);
  if (req.hostname != "localhost") {
    try {
      var code = Promise.all(checkAPI(req));
      if (code == 0) {
        next();
      }
      if (code == -10) {
        console.log("Missing API Key");
        return res.status(403).send("Missing API Key");
      }
      if (code == -50) {
        console.log("Incorrect API Key");
        return res.status(403);
      }
    } catch (error) {
      console.error("Checking API error", error);
      return res.status(500).send("Internal Server Error");
    }
  }
  if (
    req.hostname == process.env.FrontEndHostName
      ? process.env.FrontEndHostName
      : "localhost"
  ) {
    next();
  }
});
router.post("/apikey", function(req, res) {
  var key = null;
  if (
    fs.existsSync(path.resolve(process.cwd(), "./apiKeys.cfg")) &&
    apiKeys == null
  ) {
    try {
      apiKeys = JSON.parse(
        fs.readFileSync(path.resolve(process.cwd(), "./apiKeys.cfg"))
      );
    } catch (error) {
      console.error("Error reading apiKeys in " + req.originalUrl, error);
      return res.status(500).send("Internal Server Error");
    }
  } else {
    key = crypto.randomBytes(20).toString("hex");
    apiKeys.push(key);
    if (Promise.all(writeLoginFile()) == 0) {
      console.log("New Key Created");
    } else {
      console.error("Failed to make APIKey.");
      return res.status(500).send("Internal Server Error");
    }
  }
});
router.get("/id/:steamid", async function(req, res) {
  var steamid = req.params.steamid;
  var file = {};
  var stats = {};
  try {
    // console.log(path.resolve(process.cwd(),SavePath)+'/'+steamid+'.json')
    var temp = shared.ReadSteamFile(steamid);
    file = temp[0];
    stats = temp[1];
  } catch (error) {
    console.error("Reading file errored", error);
    return res.status(500).send(error);
  }
  try {
    file = JSON.parse(file);
  } catch (error) {
    console.error("File seems to be corrupted", steamid, error);
    return res.status(500).send();
  }
  var temp = {
    data: file,
    accessTime: stats.atime
  };
  return res.status(200).send(temp);
});
router.put("/id/:steamid", async function(req, res) {
  var steamid = req.params.steamid;
  var data = req.body;
  try {
    // console.log(path.resolve(process.cwd(),SavePath)+'/'+steamid+'.json')
    file = shared.SaveSteamFile(steamid, data);
  } catch (error) {
    console.error("Write file errored", error);
    return res.status(500).send(error);
  }
  return res.status(200);
});
module.exports = router;
