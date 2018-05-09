const router = require('express').Router();
const mysql = require('mysql');
const parser = require('body-parser');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "MreZ39lpdSql",
  database: "bdnetwork"
});
//RdSQL1At365d.

con.connect((err) => {
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

router.use(parser.urlencoded({extended : true}));

router.get('/', function (req, res) {
  let page_title = "ROOT";
  res.render("index", {
    page_title
  });
});

//router.get('/insertUser/:UserName/:UserPassword/:Email/:FirstName/:LastName/:Birthday', insert);
router.post('/insertUser', function(req, res) {
  var reqs = req.body;
  var userName = reqs.username;
  var userPassword = reqs.password;
  var email = reqs.email;
  var firstName = reqs.firstname;
  var lastName = reqs.lastname;
  var birthday = reqs.birthday;

  let sql = "INSERT into Users (UserName, UserPassword, Email, FirstName, LastName, Birthday) VALUES ('" + userName + "', '" + userPassword + "', '" + email + "','" + firstName + "', '" + lastName + "', '" + birthday + "')"; 
  
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.status(500);
    } else {
      console.log("1 record inserted, ID: " + result.insertId);
      res.redirect('/login.html');
    }
  });
});


function insert(req, res) {

  var reqs = req.params;
  var userName = reqs.UserName;
  var userPassword = reqs.UserPassword;
  var email = reqs.Email;
  var firstName = reqs.FirstName;
  var lastName = reqs.LastName;
  var birthday = reqs.Birthday;

  let sql = "INSERT into Users (UserName, UserPassword, Email, FirstName, LastName, Birthday) VALUES ('" + userName + "', '" + userPassword + "', '" + email + "','" + firstName + "', '" + lastName + "', '" + birthday + "')";

  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log("1 record inserted");

  });
};

//login
router.get('/selectLogin/:UserName/:UserPassword/', login);

function login(req, res) {

  var reqs = req.params;
  var userName = reqs.UserName;
  var userPassword = reqs.UserPassword;

  let loginquery = "SELECT ID FROM Users WHERE (Users.userName = '" + userName + "' AND Users.userpassword = '" + userPassword + "');";

  con.query(loginquery, function (err, result, fields) {
    if (err) {
      console.log('Wrong Log-in');
      return;
    }

    if (result[0] != null) {
      console.log("Valid login");

    } else if (result[0] != "") {
      console.log("Invalid login");

    }
  });
};

router.post('/newp', function (req, res) {
  console.log(req.body);
  let community = req.body.comID;
  let page_title = "Community " + community + " Feed";

  let newp = 'INSERT into Posts (`PosterID`, `Content`, `PostDate`, `CommunityID`) VALUES (1, "' + req.body.content + '", NOW(), "' + community + '")';

  console.log("we allmost there");
  con.query(newp, function (err, result, fields) {
    if (err) throw err;
    console.log("you posted something");
  });
  res.redirect('/feed/'+ community);
});

router.get('/feed/:Community', function (req, res) {
  var reqs = req.params;
  let community = reqs.Community;
  let page_title = "Community " + community + " Feed";
  let select_posts = `
    select users.FirstName, users.LastName, users.UserName, posts.Content, posts.PostDate
    FROM Posts
    INNER JOIN  users ON posts.PosterID = users.ID
    Where CommunityID = ` + community + `;
    `;
  con.query(select_posts, function (err, result, fields) {
    if (err) throw err;

    var feed = result;
    res.render("community", {
      page_title,
      community,
      feed
    });
  });
});

router.get('/view', function (req, res) {
  let page_title = "Testing";
  res.render("index", {
    page_title
  });
});



//verification --------------------------------


//auth login
router.get('/login', (req, res) => {
  res.render('login');
});

//auth logout
router.get('/logout', (req, res) => {
  //handle with passport
  res.send('logging out');
})

//auth with google
router.get('/google', (req, res) => {
  //handle with passport
  res.send("logging in with google");
});

//verification END --------------------------------


module.exports = router;