const express = require("express")
const app = express()
const router = express.Router()
const fs = require('fs')


const bodyParser = require('body-parser')
const axios = require('axios')
const path = require('path')

app.use(bodyParser.json())

router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
  })

router.get('/', async function (req,res){
    // console.log ("Going to send all steamids + names")
    let content = []
    var steamids = []
    // console.log(SavePath)
    // console.log(path.resolve(process.cwd(),SavePath))
    var files = []
    try{
    files=fs.readdirSync(path.resolve(process.cwd(),SavePath))
    } catch(error){
        console.error("Reading directory errored",error)
        return res.status(500).send(error)
    }
    if (files.length == 0){
        console.log("No save files in this directory",path.resolve(process.cwd(),SavePath))
    }
    files.forEach(item => {
        steamids.push(item.split('.')[0])
    })
    console.log("Next part")
    var temp=[]
    var string = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + process.env.SteamAPIKEY + "&steamids="+steamids[0]
    var iterator = 1
    for (iterator = 1; iterator < steamids.length; iterator++){
        if (iterator%99 ==0){
            temp.push(string)
            string = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + process.env.SteamAPIKEY + "&steamids="+steamids[iterator]
            continue
        }
        string +=","+steamids[iterator]
    }
    if (!iterator % 99 == 0){
        temp.push(string)
    }
    await Promise.all(temp.map(async function(element){
        await axios.get(element).then(function(res){
            data = res.data.response.players
            
            data.forEach(element => {
                var steamtemp = {
                    steamName:element.personaname,
                    steamid:element.steamid
                }
                // console.log(steamtemp)
                content.push(steamtemp)
            });
            // console.log("Content in axios",content)
        }).catch(function(error){
            console.error("Steam request errored",error)
            return res.status(500).send(error)
        })
    }))
    // console.log("Cotent outside",content)
    return res.status(200).send(content)   
})
router.get('/:steamid',async function(req,res){
    var data = req.params.steamid
    console.log(data)
    var file = {}
    try {
        console.log(path.resolve(process.cwd(),SavePath)+'/'+data+'.json')
        file = fs.readFileSync(path.resolve(process.cwd(),SavePath)+'/'+data+'.json')
    } catch (error) {
        console.error("Reading file errored",error)
        return res.status(500).send(error)
    }
    file = JSON.parse(file)
    return res.status(200).send(file)
})
module.exports = router;