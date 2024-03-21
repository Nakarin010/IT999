const express = require('express');
const path = require('path')
const port = 3000
const app = express();

const router = express.Router();
app.use(router)

router.use(express.json());
router.use(express.urlencoded({extended: true}));

// const cp = require("cookie-parser");
// router.use(cp())

// ===== MY SQL ======
var mysql = require('mysql');
const { connect } = require('http2');

var con = mysql.createConnection({
    host: "localhost",
    user: "Mahumeaw",
    password: "6588150",
    database: 'smashbook'
});

con.connect(function(err){
    if(err) throw err;
    console.log("Database Connected");
});
// ===== MY SQL ======

router.get('/', (req,res) => {   //start page
    console.log('Response index.html');
    res.sendFile(path.join(`${__dirname}/index.html`))
})

router.get('/home', (req,res) => {   //start page
    console.log('Response home.html');
    res.sendFile(path.join(`${__dirname}/home.html`))
})

router.get('/team', (req,res) => {   //start page
    console.log('Response team.html');
    res.sendFile(path.join(`/html/team.html`))
})

router.get('/reserve', (req,res) => {   //start page
    console.log('Response reserve.html');
    res.sendFile(path.join(`${__dirname}/reserve.html`))
})

router.get('/admin', (req,res) => {   //start page
    console.log('Response admin.html');
    res.sendFile(path.join(`${__dirname}/admin.html`))
})

router.post('/login-post', (req,res) => {   //login handles
    console.log(req.method);
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;

    con.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if(err){
            console.error("Database error:", err);
            res.send("Can't connect with database");
            return;
        }

        if(results.length === 0){
            res.status(401).send("Password wrong :(");
            return;
        }
        
        res.sendFile(path.join(`${__dirname}/admin/adminhome.html`))
    });

    // res.send(`Form submitted by username: ${username} password: ${password} with ${req.method}`);
});

router.get("/sqltest",function (req,res){
    console.log("Retrieved ALL SQL from server")
    let sql = "SELECT * from admin";

    con.query(sql, function (error,results){
        if(error) throw error;
            console.log(`${results.length} rows returned`);
        return res.send(results);
    })
})



app.use('/',express.static(path.join(__dirname,'static'))); // กำหนด static สำหรับภาพ

app.listen(port, () => {
    console.log("Server listen on port: "+port);
})