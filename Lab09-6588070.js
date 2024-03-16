//Nakarin Phoorahong 6588070 Sec 2
const http = require('http');
const fs = require('fs');
//const server
//response are the things that we sent out to the client
//request are the things that we get from the client
const myS = http.createServer((req,res) => {
    console.log("Listening on the port 8081");
    console.log(`Req: ${req.url}`);
    
    if(req.url === "/"){
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.write("Hello from server")
        res.write("\n");
        const Dday = new Date();
        res.write("Accessed: "+Dday);
        res.write("\n");
        res.write("Timestamp: "+Date.now().toString());
        res.end();
    }
    else if (req.url === "/search")
    {
        fs.readFile("./search.html",function(err,data){
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.write(data);
                res.end();
            
        });
    }
    else{
        fs.readFile("./error.html",function(err,data){
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/html");
            res.write(data);
            res.end();
        })

    }
});

///reserve the port 8081
myS.listen(8081, () => {
    console.log("Running");
})