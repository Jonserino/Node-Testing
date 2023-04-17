const mysql = require('mysql');
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
 
const app = express();
 
app.use(express.static('public'));
 
// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
const oneDay = 1000 * 60 * 60 * 24; // calculate one day
 
// express app should use sessions
app.use(sessions({
    secret: "thisismysecrctekeyfhgjkgfhkgfjlklkl",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
 
// set the view engine to ejs
app.set('view engine', 'ejs');
 
//username and password   
const myusername = 'user1';
const mypassword = '123';
 
// a variable to save a session
var session;
 
app.get('/', function (req, res) {
     session=req.session;
     if(session.userid){
        res.render('login_index.ejs', { 
            userid: session.userid      
        });
 
     } 
     else {
        res.render('login.ejs', { });
     }
})
 
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.render('login.ejs', {     
    });
 
})
 
app.post('/user',(req,res) => {
    if(req.body.username == myusername && req.body.password == mypassword){
        session=req.session;
        session.userid=req.body.username;
        console.log(req.session)
        res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
    }
    else{
        res.send('Invalid username or password');
    }
})
 
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})