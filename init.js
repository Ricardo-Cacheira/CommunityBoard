const mysql = require("mysql");

var sql = fs.readFileSync('CBoard.sql').toString();

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "RdSQL1At365d.",
    database: "bdnetwork"
});

con.connect(err => {
    if (err) {
        console.log("Error connecting to Db");
        return;
    } else {
        console.log("Connection established");
    }
});

con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log("finished");
});