const router = require('express').Router();
const mysql = require('mysql');
const parser = require('body-parser');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "MreZ39lpdSql",
  database: "bdnetwork"
});
//RdSQL1At365d.

con.connect((err) => {
  if (err) {
    console.log('Error connecting to Db');
    return;
  } else {
    console.log('Connection established');
  }
});

router.use(parser.urlencoded({ extended: true }));

app.use(session({
  secret: 'bigsecret',
  resave: false,
  saveUninitialized: false,
}))

//render views
router.get('/', function (req, res) {
  let page_title = "ROOT";
  res.render("index", {
    page_title
  });

});
router.get('/index', function (req, res) {
  let page_title = "Testing";
  res.render("index", {
    page_title
  });
});

router.get('/login', function (req, res) {
  let page_title = "Login";
  res.render("login", {
    page_title
  });
});

router.get('/register', function (req, res) {
  let page_title = "Register";
  res.render("register", {
    page_title
  });
});

router.get('/calendar', function (req, res) {
  let page_title = "Calendar";
  res.render("calendar", {
    page_title
  });
});

//register
router.post('/insertUser', function (req, res) {
  var reqs = req.body;
  var userName = reqs.username;
  var userPassword = reqs.password;
  var email = reqs.email;
  var firstName = reqs.firstname;
  var lastName = reqs.lastname;
  var birthday = reqs.birthday;

  bcrypt.hash(userPassword, saltRounds, function (err, hash) {
    let sql = "INSERT into Users (UserName, UserPassword, Email, FirstName, LastName, Birthday) VALUES ('" + userName + "', '" + hash + "', '" + email + "','" + firstName + "', '" + lastName + "', '" + birthday + "')";

    con.query(sql, function (err, result) {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        console.log("1 record inserted, ID: " + result.insertId);
        res.redirect('/login');
      }
    });
    console.log(sql);
  });
});

//login
router.post('/selectLogin', function (req, res) {
  var reqs = req.body;
  var userName = reqs.username;
  var userPassword = reqs.password;

  let loginquery = "SELECT UserPassword FROM Users WHERE UserName = ?;";
  let vals = [userName];

  con.query(loginquery, vals, function (sqlerr, result) {
    if (sqlerr) {
      res.status(500);
    } else {
      let hash = result[0].UserPassword;
      bcrypt.compare(userPassword, hash, function (err, bres) {
        if (bres) {
          console.log("Valid login");
          res.redirect('/feed/1');
          //call create session?
        } else {
          console.log("Invalid login")
        };
      });
    };
  });
});

//new post
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
  res.redirect('/feed/' + community);
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

// con.end();