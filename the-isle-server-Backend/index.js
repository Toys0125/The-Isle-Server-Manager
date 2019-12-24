var express = require ("express")
var app = express();
var dotenv = require("dotenv")
var fs = require("fs")
var cors = require("cors")
app.use(cors())

var steamRouter = require('./routes/steam')
var loginRouter = require('./routes/login')

app.use('/steam',steamRouter)
app.use('/login',loginRouter)

dotenv.config()
fs.readFile(process.cwd()+"/config.cfg",function(err,contents){
    var loadedContents = JSON.parse(contents)
    global.SavePath = loadedContents.Path
    var path = require('path')
    console.log("Is this the correct path to your saves",path.resolve(process.cwd(),SavePath))
})
app.listen(process.env.PORT,()=>{
    console.log("Server running on port",process.env.PORT)
})
module.exports = app;