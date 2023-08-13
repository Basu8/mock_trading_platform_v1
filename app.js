const express = require("express");
const mysql = require("mysql")
const dotenv = require("dotenv");
const path = require('path');
const router = express.Router();

dotenv.config();

const app = express();

//console.log(process.env.DATABASE_HOST)


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect( (error) => {
    if(error) {
        console.log(error);
    }
    else {
        console.log("MYSQL Connected");
    }
}) 

router.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
    //__dirname : It will resolve to your project folder.
  });
  
router.get('/login',function(req,res){
    res.sendFile(path.join(__dirname+'/public/login.html'));
  });

router.get('/register',function(req,res){
    res.sendFile(path.join(__dirname+'/public/register.html'));
  });
  
   //router.get('/sitemap',function(req,res){
//     res.sendFile(path.join(__dirname+'/sitemap.html'));
//   });
  
//   add the router
app.use('/', router);

app.listen(5000, () => {
    console.log("server on 5000");
});