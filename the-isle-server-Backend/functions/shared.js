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
    Verify:async function(username,hash){
      // console.log("verfying user",username,hash)
        if (!process.env.DatabaseModes) {
          console.log("Checking user")
            for(let i=0;i<loginDetails.length;i++) {
              let item = loginDetails[i]
              if (item.username == username) {
                console.log("correct username")
                checked = true;
                // console.debug(item.hash == data.hash);
                // console.debug(item.hash, data.hash);
                if (item.hash == hash) {
                  return true;
                } else {
                  console.log("Hash does not match", item.hash, hash)
                  return false;
                }
              }
            };
            if (!checked) {
              console.error("No Username found/incorrect username", username,hash);
              return false;
            }
          } else {
            const client = DatabaseConnect();
            var results = await client
              .query("select * from Users where username = ?;", username)
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
            if (results[0].hash == hash) {
              return true;
            } else {
              return false;
            }
          }
}}
