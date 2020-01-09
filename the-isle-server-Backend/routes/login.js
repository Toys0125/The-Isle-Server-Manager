const express = require("express")
const app = express()
const router = express.Router()
const fs = require('fs')
const bcrypt = require('bcrypt')
const crypto = require('crypto');

const bodyParser = require('body-parser')
//const axios = require('axios')
const path = require('path')

var client = null
if (process.env.DatabaseModes == 10){
    mysql = require("mysql")
    client = mysql.createPool({
        connectionLimit : 10,
        host            : process.env.DatabaseHost,
        user            : process.env.DatabaseUser,
        password        : process.env.DatabasePassword,
        database        : process.env.Database_Database
      });
}
if (process.env.DatabaseModes == 20){
    postgres = require('')
}

app.use(bodyParser.json())
var loginDetails = null
if (!process.env.DatabaseModes){
if (fs.existsSync(path.resolve(process.cwd(), './login.cfg'))) {
    loginDetails = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './login.cfg')))
} else {
    loginDetails = []
    var tempUser = {}
    tempUser.username = "Temp"
    var tempPassword = bcrypt.hashSync("Temp", 6)
    tempUser.password = tempPassword
    tempUser.scope = "Master"
    tempUser.id = 0
    loginDetails.push(tempUser)
    if (Promise.all(writeLoginFile()) == 0) {
        console.log("Created a login.cfg that a temp user with a username: Temp\npassword: Temp")
    } else {
        console.error("Failed to make Temp user.")
    }
}
}
async function writeLoginFile() {
    try {
        if (fs.existsSync(path.resolve(process.cwd(), './login.cfg'))) {
            fs.writeFileSync(path.resolve(process.cwd(), './login.cfg'), JSON.stringify(loginDetails))
            return 0
        } else {
            console.info("Creating login.cfg")
            fs.writeFileSync(path.resolve(process.cwd(), './login.cfg'), JSON.stringify(loginDetails))
            return 0
        }
    } catch (error) {
        console.error("Process error", error)
        return -10
    }
}
async function Login(username, password, res) {
    var stats = {}
    for (item in loginDetails) {
        if (item.username == username) {
            return bcrypt.compare(password, item.password).then(async function (bresponse) {
                if (!bresponse) {
                    stats.status = 401
                    return res.status(401).send("Incorrect username/password")
                }
                var hash = crypto.randomBytes(20).toString('hex')
                item.hash = hash
                var time = Date.now() + 3600000
                time = new Date(time).toISOString()
                item.time = time

                stats.status = 200
                stats.token = hash
                if (Promise.all(writeLoginFile) != -10) {
                    return res.status(200)
                } else {
                    return res.status(500).send("Internal Server Error!")
                }

            })

        }
    }
    return res.status(401).send("Incorrect username/password")
}
router.use(function timeLog(req, res, next) {
    var date = new Date()
    var formattedTimer = "[" + date.getMonth() + '/' + date.getDay() + '/' + date.getFullYear() + '] ' + date.getHours() + ':' + date.getMinutes() + ':' + (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds())
    console.log(formattedTimer, req.method, req.originalUrl)
    if (req.hostname == process.env.FrontEndHostName ? process.env.FrontEndHostName : "localhost") {
        next();
    } else {
        return res.status(403).send("Incorrect origin")
    }
})
router.post('/', async function (req, res) {
    var data = req.body
    return Login(data.username, data.password, res) // Response is handled in Login Function.
})
router.put('/user', async function (req, res) {
    var data = req.body
    for (item in loginDetails) {
        if (item.id == data.id) {
            if (data.username) {
                item.username = data.username
            }
            if (data.password) {
                item.password = bcrypt.hashSync(data.password, 6)
            }
            if (data.scope) {
                item.scope = data.scope
            }
            return res.status(200)
        }
    } return res.status(404)
})
router.post('/user', async function (req, res) {
    var data = req.body
    var user = {}
    user.username = data.username
    var tempPassword = bcrypt.hashSync(data.password, 6)
    user.password = tempPassword
    user.scope = data.scope
    user.id = length(loginDetails) - 1
    loginDetails.push(user)
    return res.status(200)
})
router.post('/verify', async function (req, res) {
    var data = req.body
    for (item in loginDetails) {
        if (item.username == data.username) {
            try {
                if (Date.parse(item.time) <= new Date.now()) {
                    res.json({
                        status: "delete"
                    })
                    return res.status(200)
                }
            } catch (error) {
                console.error(error)
                return res.status(500)
            }
            if (item.hash == data.hash) {
                return res.status(200).send("Authenticated")
            } else {
                return res.status(403).send("Incorrect")
            }
        }
    }
    console.error("No Username found", data)
    return res.status(403).send("Incorrect")
})




module.exports = router;