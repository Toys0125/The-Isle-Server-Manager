const fs = require('fs')
const path = require('path')
module.exports = {
     ReadSteamFile: function(steamid){
         var file = {}
         var stats = {}
        try{
        file = fs.readFileSync(path.resolve(process.cwd(),SavePath,'./'+steamid+'.json'),'utf8')
        stats = fs.statSync(path.resolve(process.cwd(),SavePath,'./'+steamid+'.json'))
        } catch(error){
            throw error
        }
        return [file,stats]
    },
    SaveSteamFile: function (steamid,data){
        try{
            fs.writeFileSync(path.resolve(process.cwd(),SavePath,'./'+steamid+'.json'),JSON.stringify(data))
        } catch(error){
            throw error
        }
    }
}
