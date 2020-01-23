const express = require("express")
const app = express()
const router = express.Router()



router.use(function timeLog (req, res, next) {
    var date = new Date()
    var formattedTimer =
    "[" +
    (date.getMonth() + 1) +
    "/" +
    date.getDay() +
    "/" +
    date.getFullYear() +
    "] ";
  formattedTimer +=
    date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
  formattedTimer +=
    ":" +
    date.getMinutes() +
    ":" +
    (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds());
    console.log(formattedTimer,req.method,req.originalUrl)
    /* if (req.hostname == "localhost") {
      next();
    }else{
        return res.status(403).send("Incorrect origin")
    } */
    next()
  })
router.get('/',async function(req,res){
    // console.log(req.user)
    res.json({user: req.user})
})
module.exports = router;