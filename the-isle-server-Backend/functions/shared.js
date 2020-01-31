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
    },
    Verify: function(username,hash){
        if (!process.env.DatabaseModes) {
            loginDetails.forEach(item => {
            //   console.log(item);
              if (item.username == username) {
                checked = true;
                // console.debug(item.hash == data.hash);
                // console.debug(item.hash, data.hash);
                if (item.hash == hash) {
                  return true;
                } else {
                  return false;
                }
              }
            });
            if (!checked) {
              console.error("No Username found/incorrect username", data);
              return false;
            }
          } else {
            const client = DatabaseConnect();
            var results = await client
              .query("select * from Users where username = ?;", data.username)
              .catch(function(error) {
                client.release();
                console.error(error);
                return false;
              });
            if (length(results) < 1) {
              console.error("No username found");
              return false;
            }
            client.release();
            if (results[0].hash == data.hash) {
              return true;
            } else {
              return false;
            }
          }
}}
