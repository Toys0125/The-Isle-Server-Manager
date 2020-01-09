var express = require ("express")
var app = express();
var dotenv = require("dotenv")
var fs = require("fs")
var cors = require("cors")
app.use(cors())

var steamRouter = require('./routes/steam')
var loginRouter = require('./routes/login')
var userRouter = require('./routes/user')

app.use('/steam',steamRouter)
app.use('/login',loginRouter)
app.use('/user',userRouter)

dotenv.config()
if (!process.env.PORT){
    console.error("Missing PORT in .env")
    throw "Missing PORT in .env"
}
if (process.env.DatabaseModes){
    if (!process.env.DatabaseHost){
        console.error("Missing DatabaseHost")
        throw "Missing DatabaseHost"
    }
    if (!process.env.DatabaseUser){
        console.error("Missing DatabaseHost")
        throw "Missing DatabaseHost"
    }
    if (!process.env.DatabasePassword){
        console.error("Missing DatabasePassword")
        throw "Missing DatabasePassword"
    }
    if (!process.env.Database_Database){
        console.error("Missing Database_Database")
        throw "Missing Database_Database"
    }
}
fs.readFile(process.cwd()+"/config.cfg",function(err,contents){
    if (err){
        console.error(err)
        throw "Missing config.cfg"
    }
    var loadedContents = JSON.parse(contents)
    global.SavePath = loadedContents.Path
    var path = require('path')
    console.log("Is this the correct path to your saves",path.resolve(process.cwd(),SavePath))
})
app.listen(process.env.PORT,()=>{
    console.log("Server running on port",process.env.PORT)
})
module.exports = app;