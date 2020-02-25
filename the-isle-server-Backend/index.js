var express = require ("express")
var app = express();
var dotenv = require("dotenv")
var fs = require("fs")
var path = require('path')
var cors = require("cors")
app.use(cors())
app.use(express.json())
dotenv.config()
var key = null
var cert = null
try{
key= fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.pem')&&item.includes("key")).length>0?fs.readFileSync(path.resolve(process.cwd(),'../'+fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.pem')&&item.includes("key")))):null
cert= fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.pem')&&item.includes("crt")).length>0?fs.readFileSync(path.resolve(process.cwd(),'../'+fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.pem')&&item.includes("crt")))):null
} catch(error){
    console.error(error)
}
var credentials = {
    key:key,
    cert:cert
}
// console.log(key,cert,"Key or Cert Are true or null")
// console.log(fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.pem')&&item.includes("key")))
// console.log(fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.pem')&&item.includes("key")).length)

// console.log(fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.pem')&&item.includes("key")).length>0?true:false)
// console.log(path.resolve(process.cwd(),'../'+fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.crt'))))
// console.log(fs.readFileSync(path.resolve(process.cwd(),'../'+fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.key')))))
var https = key&&cert?require('https'):null
var steamRouter = require('./routes/steam')
var loginRouter = require('./routes/login')
var userRouter = require('./routes/user')

app.use('/steam',steamRouter)
app.use('/login',loginRouter)
app.use('/user',userRouter)
if (!process.env.PORT){
    console.error("Missing PORT in .env")
    throw "Missing PORT in .env"
}
global.pool = null
if (process.env.DatabaseModes == 10) {
    mysql = require("mysql")
    pool = mysql.createPool({
        connectionLimit: 10,
        host: process.env.DatabaseHost,
        port: process.env.DatabasePort,
        user: process.env.DatabaseUser,
        password: process.env.DatabasePassword,
        database: process.env.Database_Database
    });
}
if (process.env.DatabaseModes == 20) {
    postgres = require('pg')
    var config = {
        user: process.env.DatabaseUser,
        database: process.env.Database_Database,
        password: process.env.DatabasePassword,
        host: process.env.DatabaseHost,
        port: process.env.DatabasePort,
        max: 10,
        idleTimeoutMillis: 30000
    }
    pool = new postgres.Pool(config)
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
    if(process.env.DatabaseModes==10){
        global.DatabaseConnect = function(config){return pool.createConnection(config)}
    }else if (process.env.DatabaseModes==20){
        global.DatabaseConnect = function(config){return pool.connect(config)}
    }
}
fs.readFile(path.resolve(process.cwd(),"config.cfg"),function(err,contents){
    if (err){
        console.error(err)
        throw "Missing config.cfg"
    }
    var loadedContents = JSON.parse(contents)
    global.SavePath = loadedContents.Path
    var path = require('path')
    console.log("Is this the correct path to your saves",path.resolve(process.cwd(),SavePath))
})
https==null?app.listen(process.env.PORT,()=>{
    console.log("Server running on port",process.env.PORT)
}):https.createServer(credentials,app).listen(process.env.PORT,()=>{
    console.log("Server is Running HTTPS on port",process.env.PORT)
})
module.exports = app;