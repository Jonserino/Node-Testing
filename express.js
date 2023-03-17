var express = require('express');
var app = express();
var mysql = require('mysql');
var fs = require('fs');

//azure 
var con=mysql.createConnection({host:"jons-sql.mysql.database.azure.com",
user:"Jons", password:"Passord1", database:"test", port:3306,
ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});


// links
app.use(express.static('public'));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
   con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM test_table", function (err, result, fields) {
         if (err) throw err;
         console.log(result);     

         var innhold = "anime";
   
         res.render('index.ejs', {
            data: result,
            innhold: innhold
            
        });
        console.log(result, "2")
      });
   
   });
 })

 app.get('/anime', function (req, res) {
    res.send('anime was requested');
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