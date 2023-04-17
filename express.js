var express = require('express');
var app = express();
var mysql = require('mysql');
var fs = require('fs');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');

// links
app.use(express.static('public'));

// parsin the incoming data
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24; // calculate one day

// express app should use sessions
app.use(sessions({
   secret: "Passord1",
   saveUninitialized: true,
   cookie: {maxAge: oneDay},
   resave: false
}));

// set the view engine to ejs
app.set('view engine', 'ejs');

// username and password
const myusername = 'Jons';
const mypassword = 'Passord1';

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
      res.render('login.ejs',{});
   }
})

app.get('logout', function(req, res) {
   req.session.destroy();
   res.render('login.ejs', {
   });

})

app.post('/user', (req, res) => {
   if(req.body.username == myusername && req.body.password == mypassword){
      session=req.session;
      session.userid=req.body.username;
      console.log(req.session)
      res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
   }
   else{
      res.send('invalid username or password');
   }
})



/*
app.get('/', function (req, res) {
   var con=mysql.createConnection({host:"jons-sql.mysql.database.azure.com",
   user:"Jons", password:"Passord1", database:"fitness_db", port:3306,
   ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});



   con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM user", function (err, result, fields) {
         if (err) throw err;
         console.log(result);     
        
         var innhold = "";
   
         res.render('index.ejs', {
            data: result,
            innhold: innhold
            
        });
        console.log(result, "2")
      });
      con.end();
   });
})
*/








app.get('/anime*', function (req, res) {
   res.sendfile(__dirname + "/" + "anime.html");
})

app.get('/index*', function (req, res) {
   res.sendfile(__dirname + "/" + "index.html");
})

app.get('/about*', function (req, res) {
   res.sendfile(__dirname + "/" + "about.html");
})

app.get('/login*', function (req, res) {
  res.sendfile(__dirname + "/" + "login.html");
})

app.get('/process_get', function (req, res) {
   // Prepare output in JSON format
   response = {
      username:req.query.username,
      password:req.query.password
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})