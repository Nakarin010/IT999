const express = require('express');
const path = require('path')
const port = 3070
const app = express();

const router = express.Router();
app.use(router)

const bodyParser = require('body-parser')
app.use(express.json());

// ===== MY SQL CONNECTOR ======
var mysql = require('mysql');
const { connect } = require('http2');

var con = mysql.createConnection({
    host: "210.246.215.92",
    user: "Mahumeaw",
    password: "6588150",
    database: 'smashbook'
});

con.connect(function(err){
    if(err) throw err;
    console.log("Database Connected on 210.246.215.92");
});
// ===== MY SQL CONNECTOR ======

app.post('/auth-login', (req, res) => {        // login APIs
    const username = req.body.username;
    const password = req.body.password;
    console.log("[AUTH-LOGIN] " +req.method);
    console.log(req.body);
  
      con.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], (err, results) => 
      {
        if(err){
            // console.error("Database error:", err);
            console.log("[AUTH-LOGIN] Can't connect with database for query username and password");
            res.status(500).json({ success: false , message:"Can't connect database"});
            return;
        }
        if(results.length === 0){
            console.log("[AUTH-LOGIN] Username or Password wrong :(");
            res.status(401).json({ success: false , message:"Username or password wrong:( "});
            return;
        }
        res.status(200).json({ success: true, message: "AUTHORIZED" }); // Send A Status for login success
        console.log("[AUTH-LOGIN] Authorized")        
    });
});

app.post('/search-post', (req, res) => {   // Search APIs
    console.log("[SEARCH-POST] " + req.method);
    console.log(req.body);

    const username = req.body.username;
    const date = req.body.date;
    const starttime = req.body.starttime;
    const endtime = req.body.endtime;
    const courtno = req.body.courtno;

    var sql = "SELECT * FROM slot WHERE 1 = 1";

    if (username != "") {
        sql += ` AND player_name LIKE "%${username}%"`;
    }
    if (date != "") {
        sql += ` AND date = "${date}"`;
    }
    else if(date == ""){
        sql += ` AND date >= "${date}"`
    }

    if (starttime != "" && endtime != "") {
        sql += ` AND start_time >= "${starttime}:00" AND end_time <= "${endtime}:00"`;
    } 
    else if (starttime != "" && endtime == "") 
    {
        sql += ` AND start_time >= "${starttime}:00"`;
    } 
    else if (endtime != "" && starttime == "") {
        sql += ` AND end_time <= "${endtime}:00"`;
    }

    if (courtno) {
        sql += ` AND court_id = "${courtno}"`;
    }
    console.log("[SEARCH-POST] Query sql: "+ sql);
    con.query(sql, function (error, results) 
    {
        if (error)
        {
            console.log("[SEARCH-POST] Can't connect with database for query");
            res.status(500).json({ success: false , message:"Can't connect database"});
            // throw error;
        } 
        console.log(`[SEARCH-POST] Searching ${results.length} rows returned`);
        if(results.length==0)
        {
            console.log("[SEARCH-POST] Not found")
            res.status(404).send("[SEARCH-POST] Not Found");
        }
        else
        {
            console.log("[SEARCH-POST] Search founded, returning results to client")
            console.log(results);
            res.status(200).send(JSON.stringify(results))
        }
    });
});

// ============== ADMIN USERS APIs ==================

app.post('/user', (req, res) => {        // Add users APIs
    const username = req.body.username;
    const password = req.body.password;
    console.log("[USER-ADD] " + req.method);
    console.log(req.body);

    if(username == "" || password == ""){
        console.log("[USER-ADD] Username Or Password Invalid");
        res.status(500).json({ success: false, message: "Username or Password Invalid"});
        return;
    }
    
    con.query('SELECT * FROM admin WHERE username = ?', [username], (err, results) => 
      {
        if(err){   // error
            // console.error("Database error:", err);
            console.log("[USER-ADD] Can't connect with database for query username and password");
            res.status(500).json({ success: false , message:"Can't connect to database"});
            return;
        }
        if(results.length === 0){    //  ADD USER while no duplicate
            console.log("[USER-ADD] Checking... , Don't have same username, So let insert in to database");
            con.query('INSERT INTO admin (username , password) VALUES (? , ? )', [username,password], (err,results) => {
            if (err) {
                // console.error('[USER-ADD] : ', err);
                console.log("[USER-ADD] Insert Error");
                res.status(500).json({success: false, message: "Insert Error due to database"});
                return;
            }
                console.log('[USER-ADD] Data inserted successfully');
                res.status(200).json({ success: true , message: "User has been inserted"});
            });
        }
        else
        {
            res.status(500).json({ success: false, message:"Can't add this user, Username already exist"}); //     
            console.log("[USER-ADD] Can't add this user, Username already exist");
        }
    });
});

app.delete('/user/:username', (req, res) => {        // Delete Users APIs
    const username = req.params.username;
    console.log(req.method);
    console.log(req.body);

    con.query('SELECT * FROM admin WHERE username = ?', [username], (err, results) => 
      {
        if(err){   // error
            // console.error("Database error:", err);
            console.log("[USER-DELETE] Can't connect with database for query username and password");
            res.status(500).json({ success: false , message:"Can't connect to database"});
            return;
        }
        if(results.length === 0){    //  ADD USER while no duplicate
            console.log("[USER-DELETE] Don't have this username, Can not delete");
            res.status(500).json({ success: false , message:"Don't have this username, Can not delete"});
            return;
        }
        con.query('DELETE FROM admin WHERE admin.username = ? ', [username], (err,results) => {

            if (err) {
                // console.error('Deleted Error :( :', err);
                console.log("[USER-DELETE] Can't delete due to database error");
                res.status(500).json({success: false, message: "Can't delete due to database error"});
                return;
            }
                console.log('[USER-DELETE] User deleted successfully (Username: '+username+")");
                res.status(200).json({ success: true , message:"User has been deleted."});
            });
    });
    
});

app.put('/user/:username', (req, res) => {        // Update Users APIs
    const usernamepara = req.params.username;
    const username = req.body.username;
    const password = req.body.password;
    console.log("[USER-UPDATE] "+ req.method);
    console.log(req.body);

    con.query('SELECT * FROM admin WHERE username = ?', [usernamepara], (err, results) => 
      {
        if(err){   // error
            // console.error("Database error:", err);
            console.log("[USER-UPDATE] Can't connect with database for query username and password");
            res.status(500).json({ success: false , message:"Can't connect database"});
            return;
        }
        if(results.length === 0){    //  Don't found this username
            console.log("[USER-UPDATE] Don't have this username, Can not update :(");
            res.status(500).json({ success: false , message:"Don't have this username, Can not update"});
            return;
        }
        // UPDATE admin SET username = 'Drive', password = '6588070' WHERE admin.username = 'Drivee';    (EXAMPLE)

    
        if(username != "" && password != ""){
            var sql  = `UPDATE admin SET username = '${username}', password = '${password}' WHERE admin.username = '${usernamepara}'`;
        }
        else if(username != ""){
            var sql  = `UPDATE admin SET username = '${username}' WHERE admin.username = '${usernamepara}'`;
        }
        else if(password != ""){
            var sql  = `UPDATE admin SET password = '${password}' WHERE admin.username = '${usernamepara}'`;
        }
        else{
            console.log("[USER-UPDATE] Input parameter INVALID");
            res.status(500).json({success:false , message: "Please insert username and password"})
            return;
        }
        console.log("[USER-UPDATE] Update Query String: " + sql);
        try{
        con.query(sql , [username], (err,results) => {  // Update table

            if (err) {
                //console.error('Updated Error :( :', err);
                console.log("[USER-UPDATE] Update Database Error");
                res.status(500).json({success : false, message:"Update Database Error"});
                return;
            }
                console.log('[USER-UPDATE] User updated successfully');
                res.status(200).json({success: true , message:"User has been updated"});
                return;
        });
        }catch(err){
            console.log("[USER-UPDATE] Another Error ??")
            res.status(500).json({success : false, message:"Another error ??"});
        }
    });
    
});

// ============== ADMIN USERs APIs ==================


// ============== Admin Slot Apis ===================

app.post('/slot', async (req, res) => {        // add slot APIs
    const username = req.body.username;
    const date = req.body.date;
    const starttime = req.body.starttime;
    const endtime = req.body.endtime;
    const courtno = req.body.courtno;
    console.log("[SLOT-DELETE] "+req.method);
    console.log(req.body);

    if(username == "" || date == "" || starttime == "" || endtime =="" || courtno ==""){
        console.log("[SLOT-DELETE] Don't have any parameter to update");
        res.status(500).json({success: false, message: "Please fill at least one for update"});
        return;
    }
    con.query(`SELECT * FROM slot WHERE court_id = ${courtno} AND date = '${date}' AND
    ((start_time <= '${starttime}:00' AND end_time > '${starttime}:00') OR 
    (start_time < '${endtime}:00' AND end_time >= '${endtime}:00') OR 
    (start_time > '${starttime}:00' AND end_time < '${endtime}:00') OR 
    (start_time = '${starttime}:00' AND end_time = '${endtime}:00'))`, (err, results) => // check this court no. is avaliable or not
    {
        console.log("[SLOT-DELETE] CHECK OVERLAP There are " +results.length+ " row(s) returned");
        console.log(results);
        if(err){   // error
            // console.error("Database error:", err);
            console.log("[SLOT-DELETE] Can't connect to database for query");
            res.status(500).json({ success: false , message: 'Database connection Error'});
            return;
        }
        if(results.length == 0){    //  Don't have player in this time slot :)
            console.log("[SLOT-DELETE] Don't have pverlap time slot, So can insert:)")
            let sql = `INSERT INTO slot (slot_id, court_id, price, date, start_time, end_time, player_name) VALUES (NULL, ${courtno}, 100, '${date}', '${starttime}:00', '${endtime}:00', '${username}')`  // insert into table :)
            console.log("[SLOT-DELETE] This is sql: "+sql);
            con.query(sql,  (err,results) => {
            // console.log("======= WE ARE ONE ========");  // use for debug
            if (err) {
                console.log("[SLOT-DELETE] Database Insert ERROR");
                res.status(500).json({ sccess: false ,  message: "Database Insert Error"});
                return;
            }
            // console.log("======= WE ARE THREE ========");
                console.log('[SLOT-DELETE] Data inserted successfully');
                res.status(200).json({ sccess: true ,  message: "Slot inserted successfully"});
                return;
            });
        }
        else{
            console.log("[SLOT-DELETE] Can't add this slot because slot overlap");
            res.status(500).json({success: false , message: "Can not this slot due to slot overlap :("})
            return;
        }
    });
});

app.put('/slot/:id', async (req, res) => {        // update slot APIs
    const id = req.params.id;
    
    var username = req.body.username;
    var date = req.body.date;
    var starttime = req.body.starttime;
    var endtime = req.body.endtime;
    var courtno = req.body.courtno;

    var slotid_q = ""
    var courtno_q = ""
    var price_q = ""
    var date_q = ""
    var starttime_q = ""
    var endtime_q = ""
    var username_q = ""

    console.log("[SLOT-UPDATE] " + req.method);
    console.log(req.body);
    con.query('SELECT * FROM slot WHERE slot_id = ? ', [id], (err, results) => 
      {
        if(err){   // error
            console.log("[SLOT-UPDATE] Can't connect with database for query username and password");
            res.status(500).json({ success: false , message:"Can not connect to database"});
            return;
        }
        if(results.length == 0){    //  ADD USER while no duplicate
            console.log("[SLOT-UPDATE] Can not update this id due ID does not exist");
            res.status(500).json({ success: false , message:"Can not update due to ID does not exist"});
            return;
        }
        else{
            results.forEach(results => {
                slotid_q = results.slot_id;
                courtno_q = results.court_id
                price_q = results.price;
                date_q = results.date;
                starttime_q = results.start_time;
                endtime_q = results.end_time;
                username_q = results.player_name;
              });
        if(username == ""){
            username = username_q;
        }
        if(date == ""){      // fix the fxing date
            // date = date_q.toISOString().split('T')[0]; // To transform Long date format to shorter :)
            let year = date_q.getFullYear();
            let month = String(date_q.getMonth() + 1).padStart(2, '0'); // Adding 1 to month since it's zero-based
            let day = String(date_q.getDate()).padStart(2, '0');
            date = `${year}-${month}-${day}`;
            console.log("[SLOT-UPDATE] Concat date string for query (");
        }
        else{
            console.log("[SLOT-UPDATE] Date case 2, No need to date string");
        }
        if(starttime == ""){
            starttime = starttime_q;
        }
        else{
            starttime += ":00";
        }
        if(endtime == ""){
            endtime = endtime_q;
        }
        else{
            endtime += ":00";
        }
        if(courtno == ""){
            courtno = courtno_q;
        }
        
        // ===== FOR COMPARE before and after =====
        console.log("[SLOT-UPDATE] ==== BEFORE MODIFY ====")
        console.log('[SLOT-UPDATE] Slot:', slotid_q);
        console.log('[SLOT-UPDATE] Court no:', courtno_q);
        // console.log('Price:', price_q);
        console.log('[SLOT-UPDATE] Date:', date_q );
        console.log('[SLOT-UPDATE] Starttime:', starttime_q);
        console.log('[SLOT-UPDATE] Endtime:', endtime_q);
        console.log('[SLOT-UPDATE] Username:', username_q);
        console.log("[SLOT-UPDATE] ===== AFTER MODIFIED =====")
        console.log('[SLOT-UPDATE] Slot:', id);
        console.log('[SLOT-UPDATE] Court no:', courtno);
        console.log('[SLOT-UPDATE] Date:', date);
        console.log('[SLOT-UPDATE] Starttime:', starttime);
        console.log('[SLOT-UPDATE] Endtime:', endtime);
        console.log('[SLOT-UPDATE] Username:', username);
        console.log("[SLOT-UPDATE] ===========================")
        // ===== FOR COMPARE before and after =====

        // vvvvvv For check duplicate or overlap updated slot        ถึ ง ต ร ง ย ี้
        let sql = `SELECT * FROM slot WHERE date = '${date}' AND court_id = ${courtno} AND slot_id != ${id} AND ((start_time <= '${starttime}' AND end_time > '${starttime}') OR  (start_time < '${endtime}' AND end_time >= '${endtime}') OR (start_time > '${starttime}' AND end_time < '${endtime}') OR (start_time = '${starttime}' AND end_time = '${endtime}'))`
        console.log("[SLOT-UPDATE] SQL for check duplicate: " + sql);
        con.query(sql , (err, results) => // check this court no. is avaliable or not
        {
        console.log("[SLOT-UPDATE] Check overlap, There are " +results.length+ " row(s) returned"); 
        if(err){   // error
            // console.error("Database error:", err);
            console.log("[SLOT-UPDATE] Can't connect with database for query");
            res.status(500).json({ success: false , message: 'Database Connection Error'});
            return;
        }
        if(results.length === 0){    //  Don't have player in this time slot :)
            console.log("[SLOT-UPDATE] Don't have any overlap time slots, Can update this slot :)")
            con.query(`UPDATE slot SET court_id = ${courtno}, date = '${date}' ,start_time = '${starttime}', end_time = '${endtime}' ,player_name = '${username}' WHERE slot_id = ${id}`, [username], (err, results) => 
            {
              if(err){   // error
                //   console.error("Database error:", err);
                  console.log("[SLOT-UPDATE] Can't connect with database for query");
                  res.status(500).json({ success: false , message:"Can't connect database or some error in database"});
                  return;
              }
                console.log("[SLOT-UPDATE] Slot has been updated");
                res.status(200).json({ success: true , message:"Slot has been updated"});
                return;
    
          });
        }
        else{
            console.log("[SLOT-UPDATE] There are overlap slot(s) VVVV");
            console.log(results);
            res.status(500).json({success: false, message: "Can't update, There are overlap slots(s)"});
        }
        });
        // res.status(200).json({success: true , username: username, date : date,starttime: starttime, endtime: endtime, courtno: courtno});
        res.status(500).json({success: false, message: "Another Error"});
        }
    });
});



app.delete('/slot/:id', (req, res) => {        // Delete Slot APIs
    const id = req.params.id;
    console.log("[SLOT-DELETE] " + req.method);
    console.log(req.body);

    con.query(`SELECT * FROM slot WHERE slot_id = ${id}`, (err, results) => 
      {
        if(err){   // error
            // console.error("Database error:", err);
            console.log("[SLOT-DELETE] Can't connect with database for query username and password");
            res.status(500).json({ success: false , message: "Can't connect database :("});
            return;
        }
        if(results.length === 0){    //  ADD USER while no duplicate
            console.log("[SLOT-DELETE] Can not delete slot, Don't have this slot ID");
            res.status(500).json({ success: false , message: "Can not delete slot, slot ID does not exist"});
            return;
        }
        else{
        con.query('DELETE FROM slot WHERE slot.slot_id = ? ', [id], (err,results) => {
     
            if (err) {
                // console.error('Deleted Error :( :', err);
                console.log("[SLOT-DELETE] Database delete error")
                res.status(500).json({success: false, message : "Database delete error"})
                return;
            }
                console.log('[SLOT-DELETE] Slot deleted successfully (Slot ID: '+id+")");
                res.status(200).json({ success: true , message: "Slot deleted successfully"});
            });
        }
    });

});




// ============== Admin Slot Apis ===================



app.listen(port, () => {
    console.log("Back server listen on port: "+port);
})