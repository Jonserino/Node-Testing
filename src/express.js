var express = require('express');
var app = express();
var mysql = require('mysql');
var fs = require('fs');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');

// links
app.use(express.static(__dirname));

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
      var person_nr = session.userid;
      var sql = "SELECT * FROM user WHERE person_nr = ?"
      con.query(sql, person_nr, function (err, result, fields){

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
   var email = req.body.email
   var passord = req.body.passord
   
   console.log(email, passord);
   
   // perform the MySQL query to check if the user exists
   var sql = 'SELECT * FROM user WHERE email =? AND passord =?';
   
   con = connection();
   con.query(sql, [email, passord], (error,results) => {
      if(error) {
         res.status(500).send('Internal Server Error');
      } else if(results.length === 1){
         session = req.session;
         session.userid = results[0].person_nr; // set session userid til person_nr
         console.log('Logged In');
         res.redirect('/');
                  
      } else {
         res.redirect('/login?erre=invalid'); // redirect med error beskjed i GET
         console.log('Error');
      }
   });
});


app.get('/signup', function(req, res) {
   res.render('signup.ejs',{});
})

app.post('/signup', (req, res) => {
   var con = mysql.createConnection({
      host: "jons-sql.mysql.database.azure.com",
      user: "Jons",
      password: "Passord1",
      database: "fitness_db",
      port: 3306,
      ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") }
   });

   var fornavn = req.body.fornavn;
   var mellomnavn = req.body.mellomnavn || '';
   var email = req.body.email;
   var passord = req.body.passord;
   var etternavn = req.body.etternavn;
   var tlf = req.body.tlf;
   var adresse = req.body.adresse || '';

   tlf = tlf ? parseInt(tlf) : null;

   // Step 1: Email Address Validation
   // Perform basic email address validation using a regex pattern
   var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) {
      return res.status(400).send('Invalid email address');
   }

   // Step 2: Unique Email Check
   // Check if the email already exists in the database
   var uniqueEmailCheckQuery = 'SELECT * FROM user WHERE email = ?';
   con.query(uniqueEmailCheckQuery, [email], (err, results) => {
      if (err) {
         console.error('Error checking email uniqueness:', err);
         return res.status(500).send('Internal Server Error');
      }

      if (results.length > 0) {
         return res.status(409).send('Email address already registered');
      }

      // Step 3: Case Insensitivity
      // Convert the email address to lowercase before storing it
      email = email.toLowerCase();
      
      var sql = `INSERT INTO user (fornavn, mellomnavn, etternavn, email, passord, tlf, adresse) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      var values = [fornavn, mellomnavn, etternavn, email, passord, tlf, adresse];
      
      con.query(sql, values, (err, result) => {
         if (err) {
            console.error('Error inserting user into database:', err);
            return res.status(500).send('Internal Server Error');
         }
      
         console.log('User inserted into database');
         res.render('login.ejs');
      });
   });
});


app.post('/delete-account', (req, res) => {
   // Get the authenticated user's ID or any identifier for the account
   const person_nr = session.userid; // Assuming you have implemented authentication and stored user information in req.user
   const passord = req.body.passord;

   console.log('Recieved person_nr: ', person_nr);
  
   // Connect to the database
   var con = mysql.createConnection({
      host: "jons-sql.mysql.database.azure.com",
      user: "Jons",
      password: "Passord1",
      database: "fitness_db",
      port: 3306,
      ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") }
   });

   // Perform the delete operation
   const sql = "DELETE FROM user WHERE person_nr = ? AND passord = ?";
   con.query(sql, [person_nr, passord], (err, result) => {
      if (err) {
         console.error('Error deleting account:', err);
         return res.status(500).send('Error deleting account. Please try again.');  
      }
      console.log(`Account with ID ${person_nr} deleted`);
      // Redirect or render a response indicating successful deletion
      res.redirect('/logout'); // Redirect to home page or any other desired page
   });
}); 


app.post('/user', (req, res) => {
   "SELECT * FROM user WHERE person_nr = req.body.person_nr"

   if(req.body.person_nr == person_nr && req.body.password == passord){
      session=req.session;
      session.userid=req.body.person_nr;
      console.log(req.session);
      con = connection();
      con.query("SELECT * FROM user WHERE person_nr = req.body.person_nr", function (err, result, fields){
         
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