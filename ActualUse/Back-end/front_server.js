const express = require('express');
const path = require('path')
const port = 3000
const app = express();

const router = express.Router();
app.use(router)

const bodyParser = require('body-parser');

router.use(express.json());
router.use(express.urlencoded({extended: true}));

// const cp = require("cookie-parser");
// router.use(cp())
     
router.get('/', (req,res) => {   //start page
    console.log('Response index.html');
    res.sendFile(path.join(`${__dirname}/html/index.html`))
})

router.get('/home', (req,res) => {   //start page
    console.log('Response home.html');
    res.sendFile(path.join(`${__dirname}/html/home.html`))
})

router.get('/team', (req,res) => {   //start page
    console.log('Response team.html');
    res.sendFile(path.join(`${__dirname}/html/team.html`))
})

router.get('/reserve', (req,res) => {   //start page
    console.log('Response reserve.html');
    res.sendFile(path.join(`${__dirname}/html/reserve.html`))
})

router.get('/admin', (req,res) => {   //start page
    console.log('Response admin.html');
    res.sendFile(path.join(`${__dirname}/html/admin.html`))
})

router.get('/adminhome', (req,res) => {   //start page
    console.log('Response adminhome.html');
    res.sendFile(path.join(`${__dirname}/html/admin/adminhome.html`))
})

router.get('/search-get', async (req, res) => {   //search handles
    console.log(req.method);
    console.log(req.query);
    
    const username = req.query.username;
    const date = req.query.date;
    const starttime = req.query.starttime;
    const endtime = req.query.endtime;
    const courtno = req.query.courtno;
    console.log(username +" "+ date +" "+ starttime +" "+ endtime +" "+ courtno);
    
    res.send("Form sended with this: " + username +" "+ date +" "+ starttime +" "+ endtime +" "+ courtno);
   
});

router.post('/login-post', async (req, res) => {   //login handles
    console.log(req.method);
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;

    try {
        const response = await fetch("http://localhost:3070/auth-login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (response.status === 200) {
            // Authentication success
            console.log('Authentication SUCCESSFUL!');
            res.redirect('/adminhome');
        } else if (response.status === 401) {
            // Authentication failed
            console.log('Authentication failed');
            res.status(401).send('Authentication FAILED');
        } else {
            // Handle other status codes if needed
            console.log('Unexpected status code:', response.status);
            res.status(500).send('Can not Authorized');
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).send('Can not Authorized');
    }
});










app.use('/',express.static(path.join(__dirname,'static'))); // กำหนด static สำหรับภาพ

app.listen(port, () => {
    console.log("Server listen on port: "+port);
})