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

// a variable to save a session
var session;

app.get('/', function (req, res) {
   session=req.session;
   if(session.userid){
      con = connection();
      con.query("SELECT * FROM user", function (err, result, fields){

         if (err) throw err;
         console.log(result);
         var innhold = "";
         res.render('index.ejs', {
            userid: session.userid,
            data: result,
            innhold: innhold
         });
      });   

   }
   else {
      res.render('login.ejs',{});
   }
})

app.get('/logout', function(req, res) {
   req.session.destroy();
   res.render('login.ejs', {
   });
})

app.get('/login', function(req, res) {
   res.render('login.ejs',{});
})

app.post('/login', function(req, res) {

   // hent brukernavn og passord fra skjema på login
   var person_nr = req.body.person_nr
   var passord = req.body.passord

   console.log(person_nr, passord);

   // perform the MySQL query to check if the user exists
   var sql = 'SELECT * FROM user WHERE person_nr =? AND passord =?';

   con = connection();
   con.query(sql, [person_nr, passord], (error,results) => {
      if(error) {
         res.status(500).send('Internal Server Error');
      } else if(results.length === 1){
         session = req.session;
         session.userid=req.body.person_nr; // set session userid til brukernavn
         res.redirect('/');

      } else {
         res.redirect('/login?erre=invalid'); // redirect med error beskjed i GET
      }
   });
});

app.post('/user', (req, res) => {
   "SELECT * FROM user WHERE person_nr = req.body.person_nr"



   if(req.body.username == person_nr && req.body.password == passord){
      session=req.session;
      session.userid=req.body.username;
      console.log(req.session);
      con = connection();
      con.query("SELECT * FROM user", function (err, result, fields){
         
         if (err) throw err;
         console.log(result);

         var innhold = "";

         res.render('index.ejs', {
            data: result,
            innhold: innhold
         });
      });

   }
   else{
      res.send('invalid username or password');
   }
})


function connection(){
   var con=mysql.createConnection({host:"jons-sql.mysql.database.azure.com",
   user:"Jons", password:"Passord1", database:"fitness_db", port:3306,
   ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});
   return con;
}


var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
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







/*
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
*/