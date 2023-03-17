var express = require('express');
var app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

var anime_tekst = 'en tekst om poteter';

app.get('/', function (req, res) {
    res.render('index.ejs', {
        innhold: anime_tekst
    })
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
})
