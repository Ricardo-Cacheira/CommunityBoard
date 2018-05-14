const router = require('express').Router();
const mysql = require('mysql');
const parser = require('body-parser');
var bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "RdSQL1At365d.",
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

router.use(cookieParser());
// router.use(express.static('public'));

//express mysql session
const options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "MreZ39lpdSql",
  database: "bdnetwork",
};

var sessionStore = new MySQLStore(options);

router.use(session({
  secret: 'bigsecret',
  resave: false,
  saveUninitialized: false,
}))

router.use(passport.initialize());
router.use(passport.session());

router.use(parser.urlencoded({ extended: true }));

// #region render views
router.get('/', authenticationMiddleware(), function (req, res) {
  let page_title = "ROOT";
  res.render("index", {
    page_title
  });

});
router.get('/index', authenticationMiddleware(), function (req, res) {
  console.log("req.user " + JSON.stringify(req.user));
  let page_title = "Testing";
  var communities = communityList(req.user);
  console.log("communities: "+ communities);
  res.render("index", {
    page_title
  });
});

router.get('/calendar', authenticationMiddleware(), function (req, res) {
  let page_title = "Calendar";
  res.render("calendar", {
    page_title
  });
});

router.post('/newp', authenticationMiddleware(), function (req, res) {
  let community = req.body.comID;
  let page_title = "Community " + community + " Feed";

  let newp = 'INSERT into Posts (`PosterID`, `Content`, `PostDate`, `CommunityID`) VALUES ("' + req.user + '", "' + req.body.content + '", NOW(), "' + community + '")';

  con.query(newp, function (err, result, fields) {
    if (err) throw err;
    console.log("You posted something");
  });
  res.redirect('/feed/' + community);
});

router.get('/feed/:Community', authenticationMiddleware(), function (req, res) {
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

// #endregion 

function communityList(uID)
{
  let comquery = "SELECT communityid FROM bdnetwork.communityuser WHERE UserID = ?;";
  let vals = [uID];
  let comm;
  con.query(comquery, vals, function (sqlerr, result) {
    if (sqlerr) {
      res.status(500);
    } else {
        comm = result
        console.log("comm: " +comm);
        return comm; 
    };
  });
}

// #region Login and register
router.post('/insertUser', function (req, res) {
  var reqs = req.body;
  var userName = reqs.username;
  var userPassword = reqs.password;
  var email = reqs.email;
  var firstName = reqs.firstname;
  var lastName = reqs.lastname;
  var birthday = reqs.birthday;

  bcrypt.hash(userPassword, saltRounds, function (err, hash) {
    let sqli = "INSERT into Users (UserName, UserPassword, Email, FirstName, LastName, Birthday) VALUES (?,?,?,?,?,?)";
    let vals = [userName , hash , email , firstName ,lastName , birthday];
    con.query(sqli, vals, function (err, result) {
      let sql = "SELECT LAST_INSERT_ID() as user_id";

      con.query(sql, (err, result) => {
        if (err) throw err;

        var user_id = result[0].user_id;
        //need to fix this----------------------------------------------
        console.log("Inserted used ID: " + user_id);

        //LOGIN USER-create a session
        req.login(user_id, function (err) {
          if (err) { return next(err); }
          res.redirect('/index');

        });
      });
    });
  });
});

//login
router.post('/selectLogin', function (req, res) {
  var reqs = req.body;
  var userName = reqs.username;
  var userPassword = reqs.password;

  let loginquery = "SELECT ID, UserPassword FROM Users WHERE UserName = ?;";
  let vals = [userName];

  con.query(loginquery, vals, function (sqlerr, result) {
    if (sqlerr) {
      res.status(500);
    } else {
      let hash = result[0].UserPassword;
      bcrypt.compare(userPassword, hash, function (err, bres) {
        if (bres) {
          console.log("Valid login");
          var user_id = result[0].ID;
          req.login(user_id, function (err) {
            res.redirect('/index');
          });
        } else {
          console.log("Invalid login")
        };
      });
    };
  });
});

router.get('/register', function (req, res) {
  let page_title = "Register";
  res.render("register", {
    page_title
  });
});

router.get('/login', function (req, res) {
  let page_title = "Login";
  res.render("login", {
    page_title
  });
});

router.get('/logout', function (req, res) {
  req.logOut();
  req.session.destroy(function (err) {
    res.redirect('/login'); //Inside a callback… bulletproof!
  });

});

// //Local - for local database strategy
// router.post('/login', passport.authenticate('local', {

//   successRedirect: '/index',
//   failureRedirect: '/login'

// }));

//writing user data in the session
passport.serializeUser(function (user_id, done) {
  done(null, user_id);
});

//retrieving user datafrom the session
passport.deserializeUser(function (user_id, done) {

  done(null, user_id);
});

function authenticationMiddleware() {
  return (req, res, next) => {
    // console.log(`New session : ${JSON.stringify(req.sessionID)}`);
    if (req.isAuthenticated()) return next();
    //if user not authenticated:
    res.redirect('/login')
  }
}

//#endregion 

//verification --------------------------------

//auth login
// router.get('/login', (req, res) => {
//   res.render('login');
// });

//auth logout
// router.get('/logout', (req, res) => {
//   //handle with passport
//   res.send('logging out');
// })

// //auth with google
// router.get('/google', (req, res) => {
//   //handle with passport
//   res.send("logging in with google");
// });

//verification END --------------------------------

module.exports = router;

// con.end();