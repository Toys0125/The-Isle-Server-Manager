const express = require("express");
const app = express();
const router = express.Router();
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const Joi = require("@hapi/joi");

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
    "] ";
  formattedTimer +=
    date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
  formattedTimer +=
    ":" + (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes());
  formattedTimer +=
    ":" + (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds());
  console.log(formattedTimer, req.method, req.originalUrl);
  /* if (req.hostname == "localhost") {
    next();
  } else {
    return res.status(403).send("Incorrect origin");
  } */
  next();
});

router.get("/", async function(req, res) {
  // console.log ("Going to send all steamids + names")
  let content = [];
  var steamids = [];
  // console.log(SavePath)
  // console.log(path.resolve(process.cwd(),SavePath))
  var entry = [];
  var authorization = JSON.parse(req.headers.authorization)
  const auth = Joi.object({
    username: Joi.string().required(),
    hash: Joi.string().required()
  })
  try {
    await auth.validateAsync(authorization)
  } catch (err) {
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  if (!await shared.Verify(authorization.username,authorization.hash)){
    console.log("Incorrect hash/username")
    return res.status(403).send("Incorrect hash/username")
  }
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
    client = DatabaseConnect();
  }
  // console.log("Next part");
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
  const data = Joi.object({
    steamid: Joi.string().required(),
  });
  var authorization = JSON.parse(req.headers.authorization)
  const auth = Joi.object({
    username: Joi.string().required(),
    hash: Joi.string().required()
  })
  try {
    await data.validateAsync({ steamid: steamid });
    await auth.validateAsync(authorization)
  } catch (err) {
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  if (!await shared.Verify(authorization.username,authorization.hash)){
    return res.status(403).send("Incorrect hash/username")
  }
  var file = {};
  var stats = {};
  try {
    // console.log(path.resolve(process.cwd(),SavePath)+'\'+steamid+'.json')
    var temp = shared.ReadSteamFile(steamid);
    file = temp[0];
    stats = temp[1];
    // console.log(stats);
  } catch (error) {
    console.error("Reading file errored", error);
    return res.status(500).send();
  }
  try {
    file = JSON.parse(file);
  } catch (error) {
    console.error("File seems to be corrupted", steamid, error);
    return res.status(500).send();
  }
  var temp = {
    data: file,
    accessTime: stats.mtime
  };
  return res.status(200).send(temp);
});
router.put("/id/:steamid", async function(req, res) {
  var data = req.body;
  try{
  var authorization = JSON.parse(req.headers.authorization)
  } catch(err){
    console.error("Error in authorization header",req.headers)
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  const fileschema = Joi.object({
    CharacterClass: Joi.string().required(),
    DNA: Joi.string(),
    Growth: Joi.string().required(),
    Hunger: Joi.string().required(),
    Thirst: Joi.string().required(),
    Stamina: Joi.string().required(),
    Health: Joi.string().required(),
    BleedingRate: Joi.string().required(),
    Oxygen: Joi.string().required(),
    bGender: Joi.boolean().required(),
    bIsResting: Joi.boolean().required(),
    bBrokenLegs: Joi.boolean().required(),
    ProgressionPoints: Joi.string().required(),
    ProgressionTier: Joi.string().required(),
    UnlockedCharacters: Joi.string().required(),
    CameraRotation_Isle_V3: Joi.string(),
    CameraDistance_Isle_V3: Joi.string(),
    SkinPaletteSection1: Joi.number(),
    SkinPaletteSection2: Joi.number(),
    SkinPaletteSection3: Joi.number(),
    SkinPaletteSection4: Joi.number(),
    SkinPaletteSection5: Joi.number(),
    SkinPaletteSection6: Joi.number(),
    SkinPaletteVariation: Joi.string().required()
  }).unknown(true);
  const schema = Joi.object({
    username: Joi.string().required(),
    hash: Joi.string().required(),
    file: fileschema.required()
  });
  data.username = authorization.username
  data.hash = authorization.hash
  try {
    await schema.validateAsync(data);
  } catch (err) {
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  if (!await shared.Verify(data.username,data.hash)){
    return res.status(403).send("Incorrect hash/username")
  }
  // console.log(data)
  var steamid = req.params.steamid;
  try {
    file = shared.SaveSteamFile(steamid, data);
  } catch (error) {
    console.error(
      "Error while writing to players file " +
        String(steamid) +
        " with data of",
      data,
      error
    );
    return res.status(500).send(error);
  }
  return res.status(200).send();
});
module.exports = router;
