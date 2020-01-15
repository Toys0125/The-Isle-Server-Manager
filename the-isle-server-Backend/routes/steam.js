const express = require("express");
const app = express();
const router = express.Router();
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const shared = require("../functions/shared");
if (!process.env.SteamAPIKEY) {
  console.error("Missing SteamAPIKEY in .env");
  throw "Missing SteamAPIKEY in .env";
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
    "] " +
    date.getHours() > 9 ? date.getHours() : "0" + date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds());
  console.log(formattedTimer, req.method, req.originalUrl);
  if (req.hostname == "localhost") {
    next();
  } else {
    return res.status(403).send("Incorrect origin");
  }
});

router.get("/", async function(req, res) {
  // console.log ("Going to send all steamids + names")
  let content = [];
  var steamids = [];
  // console.log(SavePath)
  // console.log(path.resolve(process.cwd(),SavePath))
  var entry = [];
  if (!process.env.DataBaseMode) {
    try {
      entry = fs.readdirSync(path.resolve(process.cwd(), SavePath));
    } catch (error) {
      console.error("Reading directory errored", error);
      return res.status(500).send(error);
    }
    if (entry.length == 0) {
      console.log(
        "No save files in this directory",
        path.resolve(process.cwd(), SavePath)
      );
    }
    entry.forEach(item => {
      steamids.push(item.split(".")[0]);
    });
  } else {
    client = DatabaseConnect()
  }
  console.log("Next part");
  var temp = [];
  var string =
    "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" +
    process.env.SteamAPIKEY +
    "&steamids=" +
    steamids[0];
  var iterator = 1;
  for (iterator = 1; iterator < steamids.length; iterator++) {
    if (iterator % 99 == 0) {
      temp.push(string);
      string =
        "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" +
        process.env.SteamAPIKEY +
        "&steamids=" +
        steamids[iterator];
      continue;
    }
    string += "," + steamids[iterator];
  }
  if (!iterator % 99 == 0) {
    temp.push(string);
  }
  await Promise.all(
    temp.map(async function(element) {
      await axios
        .get(element)
        .then(function(res) {
          data = res.data.response.players;

          data.forEach(element => {
            var steamtemp = {
              steamName: element.personaname,
              steamid: element.steamid
            };
            // console.log(steamtemp)
            content.push(steamtemp);
          });
          // console.log("Content in axios",content)
        })
        .catch(function(error) {
          console.error("Steam request errored", error);
          return res.status(500).send(error);
        });
    })
  );
  // console.log("Cotent outside",content)
  return res.status(200).send(content);
});
router.get("/id/:steamid", async function(req, res) {
  var steamid = req.params.steamid;
  var file = {};
  try {
    // console.log(path.resolve(process.cwd(),SavePath)+'/'+steamid+'.json')
    file = shared.ReadSteamFile(steamid);
  } catch (error) {
    console.error("Reading file errored", error);
    return res.status(500).send(error);
  }
  file = JSON.parse(file);
  return res.status(200).send(file);
});
router.put("/id/:steamid", async function(req, res) {
  var data = req.body;
  // console.log(data)
  var steamid = req.params.steamid;
  try {
    file = shared.SaveSteamFile(steamid, data);
  } catch (error) {
    console.error(
      "Error while writing to players file " +
        string(steamid) +
        " with data of",
      data,
      error
    );
    return res.status(500).send(error);
  }
  return res.status(200);
});
module.exports = router;
