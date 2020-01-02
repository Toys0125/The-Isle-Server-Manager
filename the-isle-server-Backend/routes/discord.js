const express = require("express")
const app = express()
const router = express.Router()
const crypto = require('crypto');
const path = require('path')
const fs = require('fs')

app.use(bodyParser.json())

var apiKeys = null

async function checkAPI(){

}

router.use(function timeLog (req, res, next) {
    var date = new Date()
    var formattedTimer = "["+date.getMonth()+'/'+date.getDay()+'/'+date.getFullYear()+'] ' + date.getHours()+':'+date.getMinutes()+':'+(date.getSeconds() >9?date.getSeconds():"0"+date.getSeconds())
    console.log(formattedTimer,req.method,req.originalUrl)
    if (req.hostname != "localhost"){
        var code = checkAPI(req.body)
    }
    next()
  })
router.post(function(req,res){
    if(fs.existsSync(path.resolve(process.cwd(),'./apiKeys.cfg'))&& apiKeys == null){
        apiKeys = JSON.parse(fs.readFileSync(path.resolve(process.cwd(),'./apiKeys.cfg')))
    }else{
        var hash = crypto.randomBytes(20).toString('hex')
        apiKeys.push(hash)
        if(Promise.all(writeLoginFile()) == 0){
            console.log("Created a apikey for ")
        } else{
            console.error("Failed to make Temp user.")
        }
    }
})
module.exports = router;