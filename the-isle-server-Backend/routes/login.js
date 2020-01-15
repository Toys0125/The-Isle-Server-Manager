const express = require("express")
const app = express()
const router = express.Router()
const fs = require('fs')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
//const axios = require('axios')
const path = require('path')
var loginDetails = null
if (!process.env.DatabaseModes) {
    if (fs.existsSync(path.resolve(process.cwd(), './login.cfg'))) {
        loginDetails = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './login.cfg')))
    } else {
        loginDetails = []
        var tempUser = {}
        tempUser.username = "Temp"
        var tempPassword = bcrypt.hashSync("Temp", 6)
        tempUser.password = tempPassword
        tempUser.scope = ["Master","Admin","User"]
        tempUser.id = 0
        loginDetails.push(tempUser)
        writeLoginFile().then(function(code){
            if (code == 0){
                console.log("Created a login.cfg that a temp user\nusername: Temp\npassword: Temp")
            } else{
                console.error("Failed to make Temp user.")
            }
        })
    }
} else {
    // Check if the user database is made
    const client = DatabaseConnect()
    var query = "If OBJECT_ID ('User.Users') IS NOT NULL Begin return 1 End;"
    var result = client.query(query)
    console.log("Check if user database exist",result)
    if (result != 1){
        query = "Create Table Users(id int NOT NULL PRIMARY KEY, username varchar(255), password varchar(255), scope varchar(255);"
        client.query(query)
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
    if (!process.env.DatabaseModes) {
        for (item in loginDetails) {
            if (item.username == username) {
                return bcrypt.compare(password, item.password).then(async function (bresponse) {
                    if (!bresponse) {
                        return res.status(401).send("Incorrect username/password")
                    }
                    var hash = crypto.randomBytes(20).toString('hex')
                    item.hash = hash
                    var time = Date.now() + 3600000
                    time = new Date(time).toISOString()
                    item.time = time
                    stats.token = hash
                    writeLoginFile().then(code =>{
                        if (code !=10){
                            res.json({
                                token: hash
                            })
                            return res.status(200)
                        } else{
                            return res.status(500).send("Internal Server Error!")
                        }
                    })
                })

            }
        }
        return res.status(401).send("Incorrect username/password")
    } else {
        const client = DatabaseConnect()
        var results = await client.query('select * from Users where username = ?;', username).catch(function (error) {
            console.error(error)
            return res.status(500)
        })
        if (length(results) < 1) {
            console.error("Username not found", username)
            return res.stauts(401).send("Incorrect username/password")
        }
        return bcrypt.compare(password, results[0].password).then(async function (bresponse) {
            if (!bresponse) {
                return res.status(401).send("Incorrect username/password")
            }
            var hash = crypto.randomBytes(20).toString('hex')
            var time = Date.now() + 3600000
            time = new Date(time).toISOString()
            await client.query('update Users set hash=?,time=? where username=?;', [hash, time, username]).catch(function (error) {
                client.release()
                console.error(error)
                return res.status(500)
            })
            client.release()
            if (Promise.all(writeLoginFile) != -10) {
                res.json({
                    token: hash
                })
                return res.status(200)
            } else {
                return res.status(500).send("Internal Server Error!")
            }

        })

    }
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
    console.log(data)
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
    if (!process.env.DatabaseModes) {
        user.username = data.username
        
        user.password = tempPassword
        user.scope = data.scope
        user.id = length(loginDetails) - 1
        loginDetails.push(user)
        return res.status(200)
    } else {
        var tempPassword = bcrypt.hashSync(data.password, 6)
        var values = [
            data.username,
            tempPassword,
            data.scope
        ]
        const client = DatabaseConnect()
        await client.query('insert into Users(username,password,scope) VALUES(?,?,?);',values).catch(function(error){
            console.error(error)
            client.release()
            return res.status(500)
        })
        return res.status(200)
    }
})
router.post('/verify', async function (req, res) {
    var data = req.body
    if (!process.env.DatabaseModes) {
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
    } else {
        const client = DatabaseConnect()
        var results = await client.query('select * from Users where username = ?;', data.username).catch(function (error) {
            client.release()
            console.error(error)
            return res.status(500)
        })
        if (length(results) < 1) {
            console.error("No username found")
            return res.status(403).send("Incorrect")
        }
        client.release()
        try {
            if (Date.parse(results[0].time) <= new Date.now()) {
                res.json({
                    status: "delete"
                })
                return res.status(200)
            }
        } catch (error) {
            console.error(error)
            return res.status(500)
        }
        if (results[0].hash == data.hash) {
            return res.status(200).send("Authenticated")
        } else {
            return res.status(403).send("Incorrect")
        }
    }

})




module.exports = router;