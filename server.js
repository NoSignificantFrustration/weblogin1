var express = require('express');
var path = require('path');
var mysql = require('mysql');
var session = require('express-session');

var port = 8080;

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'weblogin1'
});

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/public',express.static(__dirname+'/public'));

app.use(session({secret: 'titok',
                resave: true,
                saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/login.html'));
});

app.post('/auth', (req,res) => {
    var email = req.body.email;
    var jszo = req.body.password;
    if (email && jszo) {
        conn.query('SELECT * FROM users WHERE email=? AND jszo=?',[email,jszo], (error,results,fields) => {
            if(results.length>0) {
                req.session.loggedin = true;
                req.session.email = email;
                res.redirect('/homepage');
            } else {
                res.send("Nincs ilyen felhasználó!");
                res.end();
            }
        });
    } else {
        res.send("Érvénytelenek a megadott adatok!");
        res.end();
    }
    
});

app.get('/homepage', (req,res) => {
    if(req.session.loggedin) {
        res.sendFile(path.join(__dirname+'/homepage.html'));
    } else {
        res.redirect('/');
    }
});


app.get("/register", (req, res) =>{
    res.sendFile(path.join(__dirname+'/register.html'));

    
});

app.post("/reg", (req, res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var jszo = req.body.password;

            conn.query("SELECT * FROM users WHERE email=?",[email], (error, results, fields)=>{
                if (!error) {
                    if (results.length > 0) {
                        if (results[0].email == email) {
                            res.send("Ez az e-mail már használatban van");
                            res.end();
                        }
                    } else  {
                        conn.query("insert into users(nev,email,jszo) values(?,?,?)",[name, email, jszo], (error1, results1, fields1)=>{
                            if (error1) {
                                res.send("Hiba");
                                res.end();
                            } else{
                                res.redirect("/");
                            }
                            
                        });
                    }
                } else {
                    res.send("Hiba");
                    res.end();
                }
            });

});

app.listen(port);
console.log("Server listening on port " + port);