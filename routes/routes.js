const router = require("express").Router();
const mysql = require("mysql");
const parser = require("body-parser");
var bcrypt = require("bcrypt");
const saltRounds = 10;
const cookieParser = require("cookie-parser");
const session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
var passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "RdSQL1At365d.",
  database: "bdnetwork"
});
//RdSQL1At365d.

con.connect(err => {
  if (err) {
    console.log("Error connecting to Db");
    return;
  } else {
    console.log("Connection established");
  }
});

router.use(cookieParser());
// router.use(express.static('public'));

//express mysql session
const options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "RdSQL1At365d.",
  database: "bdnetwork"
};

var sessionStore = new MySQLStore(options);

router.use(
  session({
    secret: "bigsecret",
    resave: false,
    saveUninitialized: false
  })
);

router.use(passport.initialize());
router.use(passport.session());

router.use(parser.urlencoded({
  extended: true
}));

// #region render views
router.get("/", authenticationMiddleware(), function (req, res) {
  let page_title = "ROOT";
  getCommunityList(req.user, function (err, result) {
    if (err) {
      res.send(500);
    } else {

      let communityList = result;
      res.render("index", {
        page_title,
        communityList
      });
    }
  });
});

router.get("/index", authenticationMiddleware(), function (req, res) {
  console.log("req.user " + JSON.stringify(req.user));
  let page_title = "Testing";
  getCommunityList(req.user, function (err, result) {
    if (err) {
      res.send(500);
    } else {

      let communityList = result;
      res.render("index", {
        page_title,
        communityList
      });
    }
  });
});

router.get("/calendar", authenticationMiddleware(), function (req, res) {
  let page_title = "Calendar";
  getCommunityList(req.user, function (err, result) {
    if (err) {
      res.send(500);
    } else {

      let communityList = result;
      res.render("calendar", {
        page_title,
        communityList
      });
    }
  });
});

//create community

router.post("/newp", authenticationMiddleware(), function (req, res) {
  let community = req.body.comID;

  let newp =
    'INSERT into Posts (`PosterID`, `Content`, `PostDate`, `CommunityID`) VALUES ("' +
    req.user +
    '", "' +
    req.body.content +
    '", NOW(), "' +
    community +
    '")';
  con.query(newp, function (err, result, fields) {
    if (err) throw err;
    console.log("You posted something");
  });
  res.redirect("/feed/" + community);
});

router.get("/feed/:Community", authenticationMiddleware(), function (req, res) {
  var reqs = req.params;
  let community = reqs.Community;
  let page_title = "Community " + community + " Feed";
  let select_posts =
    `
    select users.FirstName, users.LastName, users.UserName, posts.Content, posts.PostDate, posts.PostID,
    (Select accepts.UserID from Accepts where userID = ? AND PostID = posts.PostID) as accepted
    FROM Posts
    INNER JOIN  users ON Posts.PosterID = users.ID
    Where CommunityID = ?;
    `;
  let vals = [req.user, community]
  con.query(select_posts, vals, function (err, result, fields) {
    if (err) throw err;

    var feed = result;
    getCommunityList(req.user, function (err, result) {
      if (err) {
        res.send(500);
      } else {

        let communityList = result;
        res.render("community", {
          page_title,
          community,
          feed,
          communityList
        });
      }
    });
  });
});

router.get("/post/:idp", authenticationMiddleware(), function (req, res) {
  var reqs = req.params;
  let postId = reqs.idp;
  let select_posts = `
    select users.FirstName, users.LastName, users.UserName, posts.Content, posts.PostDate, posts.CommunityID
    FROM Posts
    INNER JOIN  users ON posts.PosterID = users.ID
    Where PostID = ?;
    `;
  con.query(select_posts, postId, function (err, result, fields) {
    if (err) throw err;

    var post = result[0];
    let page_title = post.Content;
    let community = post.CommunityID;
    let select_comments = `
    select text,date,users.UserName
    FROM Comments
    INNER JOIN  users ON Comments.users_id = users.ID
    Where posts_id = ?;
    `;
    con.query(select_comments, postId, function (err, result2, fields) {
      if (err) throw err;

      var comments = result2;

      getCommunityList(req.user, function (err, result) {
        if (err) {
          res.send(500);
        } else {

          let communityList = result;
          res.render("post", {
            page_title,
            post,
            community,
            postId,
            communityList,
            comments
          });
        }
      });
    });
  });
});

router.post("/newc", authenticationMiddleware(), function (req, res) {
  let post = req.body.postID;

  let newc =
    'INSERT into Comments (`text`, `date`, `users_id`, `posts_id`) VALUES (?, NOW(), ?, ?)';
  let vals = [req.body.content, req.user, post];
  con.query(newc, vals, function (err, result, fields) {
    if (err) throw err;
    console.log("You commented something");
  });
  res.redirect("/post/" + post);
});

router.post("/accept", function (req, res) {
  let post = req.body.idpost;
  let check = "Select * from Accepts where userID = ? AND PostID = ?;"
  let newa = 'INSERT into Accepts (UserID, PostID) VALUES (?, ?);';
  let newr = 'DELETE FROM Accepts where userID = ? AND PostID = ?;';
  let vals = [req.user, post];

  con.query(check, vals, function (err, result, fields) {
    if (result.length > 0) {
      con.query(newr, vals, function (err, result, fields) {
        if (err) throw err;
        console.log("You rejected something");
        res.send(false);
      });
    } else {
      con.query(newa, vals, function (err, result, fields) {
        if (err) throw err;
        console.log("You accepted something");
        res.send(true);
      });
    }
  });
});

router.get("/createCommunity", authenticationMiddleware(), function (req, res) {
  let page_title = "Create YOUR Community"
  getCommunityList(req.user, function (err, result) {
    if (err) {
      res.send(500);
    } else {
      let communityList = result;
      res.render("createCommunity", {
        page_title,
        communityList
      });
    }
  });
});

router.post("/insertCommunity", function (req, res) {
  var reqs = req.body;
  var CName = reqs.CName;
  var Address = reqs.Address;
  let sql = "INSERT into Communities (CName, Address) VALUES (?,?);";
  let vals = [CName, Address];
  con.query(sql, vals, function (err, result) {
    let sqlid = "SELECT LAST_INSERT_ID() as comm_id";

    con.query(sqlid, (err, result) => {
      if (err) throw err;

      var comm_id = result[0].comm_id;
      let sqllink = "INSERT into CommunityUser (CommunityID, UserID) VALUES (?,?);";
      let values = [comm_id, req.user];

      con.query(sqllink, values, (err, result) => {
        if (err) throw err;
        console.log("linked");
      });

      res.redirect("/feed/" + comm_id);
    });
  });
});

// #endregion

function getCommunityList(uID, callback) {
  let comquery =
    "SELECT communityid FROM bdnetwork.communityuser WHERE UserID = ?;";
  let vals = [uID];
  return con.query(comquery, vals, function (sqlerr, result) {
    if (sqlerr) {
      return callback("Error", null);
    } else {
      return callback(null, result);
    }
  });
}

// #region Login and register
router.post("/insertUser", function (req, res) {
  var reqs = req.body;
  var userName = reqs.username;
  var userPassword = reqs.password;
  var email = reqs.email;
  var firstName = reqs.firstname;
  var lastName = reqs.lastname;
  var birthday = reqs.birthday;

  bcrypt.hash(userPassword, saltRounds, function (err, hash) {
    let sqlid =
      "INSERT into Users (UserName, UserPassword, Email, FirstName, LastName, Birthday) VALUES (?,?,?,?,?,?)";
    let vals = [userName, hash, email, firstName, lastName, birthday];
    con.query(sqlid, vals, function (err, result) {
      let sql = "SELECT LAST_INSERT_ID() as user_id";

      con.query(sql, (err, result) => {
        if (err) throw err;

        var user_id = result[0].user_id;
        //need to fix this----------------------------------------------
        console.log("New user with ID: " + user_id);

        //LOGIN USER-create a session
        req.login(user_id, function (err) {
          if (err) {
            return next(err);
          }
          res.redirect("/index");
        });
      });
    });
  });
});

//login
router.post("/selectLogin", function (req, res) {
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
            res.redirect("/index");
          });
        } else {
          console.log("Invalid login");
        }
      });
    }
  });
});

router.get("/register", function (req, res) {
  let page_title = "Register";
  res.render("register", {
    page_title
  });
});

router.get("/login", function (req, res) {
  let page_title = "Login";
  res.render("login", {
    page_title
  });
});

router.get("/logout", function (req, res) {
  req.logOut();
  //this works?
  // req.clearCookie();
  req.session.destroy(function (err) {
    res.redirect("/login"); //Inside a callback… bulletproof!
  });
});

router.get("/search", function (req, res) {
  con.query(
    'SELECT ID, CName, Address FROM Communities WHERE CName LIKE "%' +
    req.query.key +
    '%" OR Address LIKE "%' +
    req.query.key +
    '%"',
    function (err, rows, fields) {
      console.log(req.query.key);
      if (err) throw err;
      var data = [];
      var newrows;
      for (i = 0; i < rows.length; i++) {
        // data.push(rows[i].CName, rows[i].Address);
        data.push({
          ID: rows[i].ID,
          CName: rows[i].CName,
          Address: rows[i].Address
        });

        // con.query('SELECT ID from Communities where CName like "' + req.query.key + '" OR Address like "' + req.query.key + '"',  function (err, rows, fields) {
        //   if (err) return err;
        //   if (rows.length != 0) {
        //     newrows = JSON.stringify(rows[0].ID);
        //     console.log(newrows);
        //     // res.send(newrows);
        //   }
        // });
      }
      res.send(JSON.stringify(data));
    }
  );
});

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
    res.redirect("/login");
  };
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