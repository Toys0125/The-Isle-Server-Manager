const express = require("express")
const router = express.router
const fs = require('fs')

router.get('/', async function (req,res){
    console.log ("Going to send all steamids + names")
    var content = []
    var steamids = []
    fs.readdir(Path,function(err,files){
        files.forEach(file => {
            console.log(file)
        });
    })
})