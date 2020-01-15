const fs = require('fs')
const path = require('path')
module.exports = {
     ReadSteamFile: function(steamid){
         var file = {}
        try{
        file = fs.readFileSync(path.resolve(process.cwd(),SavePath)+'/'+steamid+'.json','utf8')
        } catch(error){
            throw error
        }
        return file
    },
    SaveSteamFile: function (steamid,data){
        try{
            fs.writeFileSync(path.resolve(process.cwd(),SavePath)+'/'+steamid+'.json',JSON.stringify(data))
        } catch(error){
            throw error
        }
    }
}
