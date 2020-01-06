const fs = require('fs')
const path = require('path')

function ReadSteamFile(steamid){
    try{
    file = fs.readFileSync(path.resolve(process.cwd(),SavePath)+'/'+steamid+'.json')
    } catch(error){
        throw error
    }
}
function SaveSteamFile(steamid,data){
    try{
        fs.writeFileSync(path.resolve(process.cwd(),SavePath)+'/'+steamid+'.json',JSON.stringify(data))
    } catch(error){
        throw error
    }
}