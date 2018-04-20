//Module dependencies
var mysql = require('mysql');
var express = require('express');

const app = express();



app.listen(3000, () => console.log("Example app listening to port 3000"));

app.use(express.static('public'));

//App initialization
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'MreZ39lpdSql',
  port: '3306',
  database: 'bdnetwork'

});

connection.connect(function (err) {
  if (err) throw err
  console.log('You are now connected...');
});

app.get('/insertUser/:UserName/:UserPassword/:Email/:FirstName/:LastName/:Birthday', insert);

function insert(req, res) {

  var reqs = req.params;
  var userName = reqs.UserName;
  var userPassword = reqs.UserPassword;
  var email = reqs.Email;
  var firstName = reqs.FirstName;
  var lastName = reqs.LastName;
  var birthday = reqs.Birthday;

  let sql = "INSERT into Users (UserName, UserPassword, Email, FirstName, LastName, Birthday) VALUES ('" + userName + "', '" + userPassword + "', '" + email + "','" + firstName + "', '" + lastName + "', '" + birthday + "')";

  connection.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log("1 record inserted");
  });

  connection.query("SELECT * FROM Users", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });

}

