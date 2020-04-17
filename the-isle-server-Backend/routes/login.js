const express = require("express");
const app = express();
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
//const axios = require('axios')
const path = require("path");
const Joi = require("@hapi/joi");
const shared = require("../functions/shared");
global.loginDetails = null;
if (!process.env.DatabaseModes) {
  if (fs.existsSync(path.resolve(process.cwd(), "./login.cfg"))) {
    loginDetails = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "./login.cfg"))
    );
  } else {
    loginDetails = [];
    var tempUser = {};
    tempUser.username = "Temp";
    var tempPassword = bcrypt.hashSync("Temp", 6);
    tempUser.password = tempPassword;
    tempUser.scope = ["Master", "Admin", "User"];
    tempUser.id = 0;
    loginDetails.push(tempUser);
    writeLoginFile().then(function(code) {
      if (code == 0) {
        console.log(
          "Created a login.cfg that a temp user\nusername: Temp\npassword: Temp"
        );
      } else {
        console.error("Failed to make Temp user.");
      }
    });
  }
} else {
  // Check if the user database is made
  const client = DatabaseConnect();
  var query = "If OBJECT_ID ('User.Users') IS NOT NULL Begin return 1 End;";
  var result = client.query(query);
  console.log("Check if user database exist", result);
  if (result != 1) {
    query =
      "Create Table Users(id int NOT NULL PRIMARY KEY, username varchar(255), password varchar(255), scope varchar(255);";
    client.query(query);
  }
}
async function writeLoginFile() {
  try {
    if (fs.existsSync(path.resolve(process.cwd(), "./login.cfg"))) {
      fs.writeFileSync(
        path.resolve(process.cwd(), "./login.cfg"),
        JSON.stringify(loginDetails)
      );
      return 0;
    } else {
      console.info("Creating login.cfg");
      fs.writeFileSync(
        path.resolve(process.cwd(), "./login.cfg"),
        JSON.stringify(loginDetails)
      );
      return 0;
    }
  } catch (error) {
    console.error("Process error", error);
    return -10;
  }
}
async function Login(username, password, res) {
  var stats = {};
  var checked = false;
  if (!process.env.DatabaseModes) {
    try {
      for (let i = 0; i < loginDetails.length; i++) {
        item = loginDetails[i];
        console.debug(item);
        if (item.username == username) {
          checked = true;
          return bcrypt
            .compare(password, item.password)
            .then(async function(bresponse) {
              if (!bresponse) {
                console.debug("Incorrect Password");
                return res.status(401).send("Incorrect username/password");
              }
              var hash = crypto.randomBytes(20).toString("hex");
              item.hash = hash;
              var time = Date.now() + 3600000;
              time = new Date(time).toISOString();
              item.time = time;
              stats.token = hash;
              await writeLoginFile().then(code => {
                if (code != 10) {
                  console.log("Written to File");
                  res.json({
                    hash: hash,
                    scope: item.scope
                  });
                  return res.status(200);
                } else {
                  return res.status(500).send("Internal Server Error!");
                }
              });
            });
        }
      }
    } catch (error) {
      console.error(error);
      return error ? reject(error) : null;
    }
    if (!checked) {
      console.debug("Incorrect username");
      return res.status(401).send("Incorrect username/password");
    }
  } else {
    const client = DatabaseConnect();
    var results = await client
      .query("select * from Users where username = ?;", username)
      .catch(function(error) {
        console.error(error);
        return res.status(500).send();
      });
    if (length(results) < 1) {
      console.error("Username not found", username);
      return res.stauts(401).send("Incorrect username/password");
    }
    return bcrypt
      .compare(password, results[0].password)
      .then(async function(bresponse) {
        if (!bresponse) {
          return res.status(401).send("Incorrect username/password");
        }
        var hash = crypto.randomBytes(20).toString("hex");
        var time = Date.now() + 3600000;
        time = new Date(time).toISOString();
        await client
          .query("update Users set hash=?,time=? where username=?;", [
            hash,
            time,
            username
          ])
          .catch(function(error) {
            client.release();
            console.error(error);
            return res.status(500).send();
          });
        client.release();
        if (Promise.all(writeLoginFile) != -10) {
          res.json({
            token: hash
          });
          return res.status(200);
        } else {
          return res.status(500).send("Internal Server Error!");
        }
      });
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
    ":" + (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes());
  formattedTimer +=
    ":" + (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds());
  console.log(formattedTimer, req.method, req.originalUrl);
  /* if (
    req.hostname == process.env.FrontEndHostName
      ? process.env.FrontEndHostName
      : "localhost"
  ) {
    next();
  } else {
    return res.status(403).send("Incorrect origin");
  } */
  next();
});
router.get("/", async function(req, res) {
  var group = [];
  var authorization = JSON.parse(req.headers.authorization);
  const auth = Joi.object({
    username: Joi.string().required(),
    hash: Joi.string().required()
  });
  try {
    await auth.validateAsync(authorization);
  } catch (err) {
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  if (!(await shared.Verify(authorization.username, authorization.hash))) {
    return res.status(403).send("Incorrect hash/username");
  }
  loginDetails.forEach(item => {
    var temp = {
      username: item.username,
      id: item.id,
      scope: item.scope
    };
    group.push(temp);
  });
  res.status(200).send(group);
});
router.post("/", async function(req, res) {
  var data = req.body;
  const schema = Joi.object({
    username: Joi.string().required().max(24),
    password: Joi.string().required().max(64)
  });
  try {
    await schema.validateAsync(data);
  } catch (err) {
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  // console.log(data)
  return Login(data.username, data.password, res); // Response is handled in Login Function.
});
router.post("/logout", async function(req, res) {
  var data = req.body;
  const schema = Joi.object({
    username: Joi.string().required()
  });
  try {
    await schema.validateAsync(data);
  } catch (err) {
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  var checked = false;
  loginDetails.forEach(item => {
    if (item.username == data.username) {
      checked = true;
      item.hash = null;
      return res.status(200).send();
    }
  });
  if (!checked) {
    return res.status(404).send();
  }
});
router.put("/user", async function(req, res) {
  var data = req.body;
  // console.log(data)
  var authorization = JSON.parse(req.headers.authorization);
  const userSchema = Joi.object({
    id: Joi.number().required(),
    username: Joi.string(),
    password: Joi.string(),
    scope: Joi.array()
  });
  const schema = Joi.object({
    username: Joi.string().required(),
    hash: Joi.string().required(),
    userdata: userSchema.required()
  });
  data.username = authorization.username;
  data.hash = authorization.hash;
  try {
    await schema.validateAsync(data);
  } catch (err) {
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  if (!(await shared.Verify(data.username, data.hash))) {
    return res.status(403).send("Incorrect hash/username");
  }
  var checked = false;
  loginDetails.forEach(item => {
    console.log(item);
    if (item.id == data.userdata.id) {
      checked = true;
      if (data.userdata.username) {
        item.username = data.userdata.username;
      }
      if (data.userdata.password) {
        item.password = bcrypt.hashSync(data.userdata.password, 6);
      }
      if (data.userdata.scope) {
        item.scope = data.userdata.scope;
      }
      console.log("Sending");
      return res.status(200).send();
    }
  });
  if (!checked) {
    return res.status(404).send();
  }
});
router.post("/user", async function(req, res) {
  var data = req.body;
  console.log(req.headers.authorization);
  var authorization = JSON.parse(req.headers.authorization);
  console.log(authorization);
  const userSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    scope: Joi.array().required()
  });
  const schema = Joi.object({
    username: Joi.string().required(),
    hash: Joi.string().required(),
    userdata: userSchema.required()
  });
  data.username = authorization.username;
  data.hash = authorization.hash;
  try {
    await schema.validateAsync(data);
  } catch (err) {
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  if (!(await shared.Verify(data.username, data.hash))) {
    return res.status(403).send("Incorrect hash/username");
  }
  var user = {};
  if (!process.env.DatabaseModes) {
    for (let i = 0;i<loginDetails.length;i++){
      item = loginDetails[i]
      if (item.username == data.userdata.username) {
        console.log("Username Already Taken", username);
        return res.status(403).send("Username Already Taken");
      }
    };
    user.username = data.userdata.username;
    var tempPassword = bcrypt.hashSync(data.userdata.password, 6);
    user.password = tempPassword;
    user.scope = data.userdata.scope;
    user.id = loginDetails.length - 1;
    loginDetails.push(user);
    await writeLoginFile().then(function(code){
      if (code !=10){
        console.log("Added",data.userdata.username,"to loginDetails")
        return res.status(200).send();
      } else{
        console.log("Error in writing file for",data.userdata.username)
        return res.status(500).send()
      }
    })
    
  } else {
    var tempPassword = bcrypt.hashSync(data.userdata.password, 6);
    var values = [data.username, tempPassword, data.userdata.scope];
    const client = DatabaseConnect();
    await client
      .query(
        "insert into Users(username,password,scope) VALUES(?,?,?);",
        values
      )
      .catch(function(error) {
        console.error(error);
        client.release();
        return res.status(500).send();
      });
    return res.status(200).send();
  }
});
router.post("/verify", async function(req, res) {
  var data = req.body;
  const schema = Joi.object({
    username: Joi.string().required(),
    hash: Joi.string().required()
  });
  try {
    await schema.validateAsync(data);
  } catch (err) {
    console.error(req.connection.remoteAddress, err);
    return res.status(422).send(err);
  }
  //   console.log(data);
  var checked = false;
  if (!process.env.DatabaseModes) {
    loginDetails.forEach(item => {
      //   console.log(item);
      if (item.username == data.username) {
        checked = true;
        try {
          if (Date.parse(item.time) <= Date.now() || item.hash == null) {
            res.json({
              status: "delete"
            });
            return res.status(200);
          }
        } catch (error) {
          console.error(error);
          return res.status(500).send();
        }
        // console.debug(item.hash == data.hash);
        // console.debug(item.hash, data.hash);
        if (item.hash == data.hash) {
          res.json({
            scope: item.scope
          });
          return res.status(200);
        } else {
          return res.status(403).send("Incorrect");
        }
      }
    });
    if (!checked) {
      console.error("No Username found/incorrect username", data);
      res.json({
        status: "delete"
      });
      return res.status(200);
    }
  } else {
    const client = DatabaseConnect();
    var results = await client
      .query("select * from Users where username = ?;", data.username)
      .catch(function(error) {
        client.release();
        console.error(error);
        return res.status(500).send();
      });
    if (length(results) < 1) {
      console.error("No username found");
      return res.status(403).send("Incorrect");
    }
    client.release();
    try {
      if (Date.parse(results[0].time) <= new Date.now()) {
        res.json({
          status: "delete"
        });
        return res.status(200);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send();
    }
    if (results[0].hash == data.hash) {
      return res.status(200).send("Authenticated");
    } else {
      return res.status(403).send("Incorrect");
    }
  }
});

module.exports = router;
