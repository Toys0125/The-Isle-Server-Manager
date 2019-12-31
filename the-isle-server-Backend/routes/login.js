const express = require("express")
const app = express()
const router = express.Router()
const fs = require('fs')
const bcrypt = require('bcrypt')
const crypto = require('crypto');

const bodyParser = require('body-parser')
//const axios = require('axios')
const path = require('path')

app.use(bodyParser.json())
var loginDetails = null
if(fs.existsSync(path.resolve(process.cwd(),'./login.cfg'))){
    loginDetails = JSON.parse(fs.readFileSync(path.resolve(process.cwd(),'./login.cfg')))
}else{
    loginDetails = []
    var tempUser = {}
    tempUser.username="Temp"
    var tempPassword = bcrypt.hashSync("Temp",6)
    tempUser.password=tempPassword
    loginDetails.push(tempUser)
    fs.writeFileSync(path.resolve(process.cwd(),'./login.cfg'),JSON.stringify(loginDetails))
}
async function writeLoginFile() {
    try{
    if(fs.existsSync(path.resolve(process.cwd(),'./login.cfg'))){
        fs.writeFileSync(path.resolve(process.cwd(),'./login.cfg'),JSON.stringify(loginDetails))
    }else{
        console.error("Missing login.cfg")
        return -10
    }
    }catch(error){
        console.error("Process error")
        return -10
    }
}
router.use(function timeLog (req, res, next) {
    var date = new Date()
    var formattedTimer = "["+date.getMonth()+'/'+date.getDay()+'/'+date.getFullYear()+'] ' + date.getHours()+':'+date.getMinutes()+':'+(date.getSeconds() >9?date.getSeconds():"0"+date.getSeconds())
    console.log(formattedTimer,req.method,req.originalUrl)
    next()
  })
router.post('/',async function(req,res){
    var data = req.body
    for(item in loginDetails){
        if(item.username == data.username){
            return bcrypt.compare(data.password,item.password).then(async function(bresponse){
                if (!bresponse){
                    return res.status(401).send("Incorrect Username or Password")
                }
                var hash = crypto.randomBytes(20).toString('hex')
                item.hash = hash
                var time = Date.now()+3600000
                time = new Date(time).toISOString()
                item.time = time
                res.json({
                    hash:hash
                })
                if(Promise.all(writeLoginFile) != -10){
                    return res.status(200)
                }else{
                    return res.status(500).send("Internal Server Error!")
                }
                
            })
            
        }
    }
})
router.post('/verify',async function(req,res){
    var data = req.body
    for (item in loginDetails){
        if (item.username == data.username){
            if(Date.parse(item.time)<=new Date.now()){
                res.json({
                    status:"delete"
                })
                return res.status(200)
            }
            if(item.hash == data.hash){
                return res.status(200).send("Authenticated")
            }
        }
    }
})




module.exports = router;