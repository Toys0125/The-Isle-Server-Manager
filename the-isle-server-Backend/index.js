var express = require ("express")
var app = express();
var dotenv = require("dotenv")
var fs = require("fs")

dotenv.config()
fs.readFile(process.cwd()+"config.cfg",function(err,contents){
    var loadedContents = JSON.parse(contents)
    global.SavePath = loadedContents.Path
})
app.listen(process.env.PORT,()=>{
    console.log("Server running on port ",process.env.PORT)
})