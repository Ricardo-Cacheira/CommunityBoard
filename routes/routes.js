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

//get personal events
router.get("/todo", authenticationMiddleware(), function (req, res) {
  let page_title = "To-Do";
  let getEvents = `
  SELECT users_has_events.events_id, events.id, events.description, (SELECT DATE_FORMAT(events.date, "%H:%i - %W %b %e %Y")) as date
  FROM events
  INNER JOIN users_has_events ON events.id = users_has_events.events_id
  WHERE users_id = ?
  ORDER BY events.date DESC;`;

  //and date > now() ?
  con.query(getEvents, req.user, function (err, result) {

    if (err) throw err;
    let events = result;
    getCommunityList(req.user, function (err, result) {
      if (err) {
        res.send(500);
      } else {
        let communityList = result;
        res.render("todo", {
          page_title,
          events,
          communityList
        });
      }
    });
  });
});

//create personal events
router.post('/insertTodo', function (req, res) {
  var reqs = req.body;
  var description = reqs.description;
  var date = reqs.date;

  let newEvent = 'INSERT INTO events (description, date) VALUES (?, ?);';
  let vals = [description, date]
  con.query(newEvent, vals, function (err, result) {
    if (err) throw err;
    let eventOwner = 'INSERT INTO users_has_events (users_id, events_id) VALUES (?, ?);';

    let ownervals = [req.user, result.insertId]
    con.query(eventOwner, ownervals, function (err, result) {
      if (err) {
        throw err;
      } else {
        res.redirect('/todo');
      }
    });
  });
});

//get profile (info and accepts)
router.get("/profile", authenticationMiddleware(), function (req, res) {
  let page_title = 'Profile';
  let selectProfile = `SELECT * FROM users WHERE id= ?;`;

  con.query(selectProfile, req.user, function (err, result) {
    let userinfo = result[0];

    let selectPosts = `SELECT posts.content, 
      (SELECT COUNT(*) FROM accepts WHERE posts_id = posts.id AND users_id != ?) AS acceptCount
      FROM posts 
      WHERE posts.users_id = ?
      HAVING acceptCount != 0;`;

    let vals = [req.user, req.user]
    con.query(selectPosts, vals, function (err, result) {
      console.log(result);
      let accepts = result;

      getCommunityList(req.user, function (err, result) {
        let communityList = result;
        res.render("profile", {
          page_title,
          userinfo,
          accepts,
          communityList
        });
      });
    });
  });
});

//update user info
router.post('/updateUser', function (req, res) {
  var reqs = req.body;
  var userName = reqs.username;
  var email = reqs.email;
  var firstName = reqs.firstname;
  var lastName = reqs.lastname;

  getCommunityList(req.user, function (err, result) {
    let updateuser = `UPDATE users SET userName = '` + userName + `', email = '` + email + `', firstName = '` + firstName + `', lastName = '` + lastName + `' WHERE id= 1;`;
    let vals = [req.user];
    console.log(vals);
    con.query(updateuser, vals, function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log('User info updated')
        res.redirect('/index')
      }
    });
  });
});

router.get('/acceptHelp', authenticationMiddleware(), function (req, res) {
  let accepth = `SELECT content, date, id FROM posts WHERE users_id = '?';`;
  let vals = [req.user];

  con.query(accepth, vals, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render("community", {
      page_title,
      community,
      feed,
      communityList
    });
  });
});

// router.post('/')

//create community

router.post("/newp", authenticationMiddleware(), function (req, res) {
  let community = req.body.comID;
  let newp =
    'INSERT into posts (`users_id`, `content`, `date`, `communities_id`) VALUES ("' +
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
  let belongs, role, requests, communityName, members;
  let page_title = "Community " + community + " Feed";
  let select_posts =
    `
    select users.firstName, users.lastName, users.userName, posts.content,(SELECT DATE_FORMAT(posts.date, "%H:%i - %d/%m/%Y")) as 'date', posts.id,
    (Select accepts.users_id from accepts where users_id = ? AND posts_id = posts.id) as accepted
    FROM posts
    INNER JOIN  users ON posts.users_id = users.id
    Where communities_id = ?
    ORDER BY posts.date DESC;
    `;
  let vals = [req.user, community];
  con.query(select_posts, vals, function (err, result, fields) {
    if (err) throw err;

    var feed = result;

    let check = "Select * from communities_has_users where users_id = ? AND communities_id = ?;";

    con.query(check, vals, function (err, result, fields) {
      if (result.length > 0) {
        belongs = true;
        role = result[0].role;
      } else {
        belongs = false;
      }
    });

    let reqJoin = `
    select users.firstName, users.lastName, users.userName, users.id
    FROM requests
    INNER JOIN  users ON requests.users_id = users.id
    Where communities_id = ?;
    `;

    con.query(reqJoin, community, function (err, result, fields) {
      requests = result;
    });

    let cominfo = `select * FROM communities Where id = ?;`;

    con.query(cominfo, community, function (err, result, fields) {
      communityName = result[0].cName;
    });

    let memberList = `
    select users.firstName, users.lastName, users.userName
    FROM communities_has_users
    INNER JOIN  users ON communities_has_users.users_id = users.id
    Where communities_id = ?;
    `;

    con.query(memberList, community, function (err, result, fields) {
      members = result;
    });

    getCommunityList(req.user, function (err, result) {
      if (err) {
        res.send(500);
      } else {

        let communityList = result;
        res.render("community", {
          page_title,
          community,
          feed,
          communityList,
          belongs,
          role,
          requests,
          communityName,
          members
        });
      }
    });
  });
});

router.get("/post/:idp", authenticationMiddleware(), function (req, res) {
  var reqs = req.params;
  let belongs, role, requests, communityName,members;
  let postId = reqs.idp;
  let select_posts = `
    select users.firstName, users.lastName, users.userName, posts.content, (SELECT DATE_FORMAT(posts.date, "%H:%I - %d/%m/%Y")) as 'date', posts.communities_id
    FROM posts
    INNER JOIN  users ON posts.users_id = users.id
    Where posts.id = ?;
    `;
  con.query(select_posts, postId, function (err, result, fields) {
    if (err) throw err;

    var post = result[0];
    let page_title = post.content;
    let community = post.communities_id;
    let select_comments = `
    select text,(SELECT DATE_FORMAT(date, "%d/%m/%Y")) as 'date',users.userName
    FROM comments
    INNER JOIN  users ON comments.users_id = users.id
    Where posts_id = ?
    ORDER BY comments.date DESC;
    `;
    con.query(select_comments, postId, function (err, result2, fields) {
      if (err) throw err;

      var comments = result2;

      let check = "Select * from communities_has_users where users_id = ? AND communities_id = ?;";
      let vals = [req.user, community];
      con.query(check, vals, function (err, result, fields) {
        if (result.length > 0) {
          console.log("belongs");
          belongs = true;
          role = result[0].role;
        } else {
          console.log("doesnt belong");
          belongs = false;
        }
      });

      let reqJoin = `
      select users.firstName, users.lastName, users.userName, users.id
      FROM requests
      INNER JOIN  users ON requests.users_id = users.id
      Where communities_id = ?;
      `;
  
      con.query(reqJoin, community, function (err, result, fields) {
        requests = result;
      });

      let cominfo = `select * FROM communities Where id = ?;`;

      con.query(cominfo, community, function (err, result, fields) {
        console.log(result);
        communityName = result[0].cName;
      });

      let memberList = `
      select users.firstName, users.lastName, users.userName
      FROM communities_has_users
      INNER JOIN  users ON communities_has_users.users_id = users.id
      Where communities_id = ?;
      `;
  
      con.query(memberList, community, function (err, result, fields) {
        members = result;
      });

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
            comments,
            belongs,
            role,
            requests,
            communityName,
            members
          });
        }
      });
    });
  });
});

router.post("/newc", authenticationMiddleware(), function (req, res) {
  let post = req.body.postID;

  let newc =
    'INSERT into comments (`text`, `date`, `users_id`, `posts_id`) VALUES (?, NOW(), ?, ?)';
  let vals = [req.body.content, req.user, post];
  con.query(newc, vals, function (err, result, fields) {
    if (err) throw err;
    console.log("You commented something");
  });
  res.redirect("/post/" + post);
});

router.post("/accept", function (req, res) {
  let post = req.body.idpost;
  let check = "Select * from accepts where users_id = ? AND posts_id = ?;";
  let newa = 'INSERT into accepts (users_id, posts_id, date) VALUES (?, ?, NOW());';
  let newr = 'DELETE FROM accepts where users_id = ? AND posts_id = ?;';
  let vals = [req.user, post];
  console.log(post);

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

router.post("/addUser", function (req, res) {
  let user = req.body.iduser;
  let com = req.body.community;
  let check = "Select * from communities_has_users where communities_id = ? AND users_id = ?;";
  let newa = 'insert into communities_has_users (communities_id, users_id, role) Values(?,?,0);';
  let newd = 'DELETE FROM requests where communities_id = ? AND users_id = ?;';
  let vals = [com, user];

  con.query(check, vals, function (err, result, fields) {
    if (result.length > 0) {
      con.query(newd, vals, function (err, result, fields) {
        if (err) throw err;
        console.log("This dude already there");
        res.send(false);
      });
    } else {
      con.query(newa, vals, function (err, result, fields) {
        if (err) throw err;
        con.query(newd, vals, function (err, result, fields) {
          if (err) throw err;
          console.log("You accepted someone");
          res.send(true);
        });
      });
    }
  });
});

router.post("/request", function (req, res) {
  let com = req.body.com;
  let check = "Select * from requests where users_id = ? AND communities_id = ?;";
  let newr = 'INSERT into requests (users_id, communities_id) VALUES (?, ?);';
  let vals = [req.user, com];

  con.query(check, vals, function (err, result, fields) {
    if (result.length > 0) {
      console.log("Already requested");
      res.send(false);
    } else {
      con.query(newr, vals, function (err, result, fields) {
        if (err) throw err;
        console.log("You requested something");
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
//add another valeu
router.post("/insertCommunity", function (req, res) {
  var reqs = req.body;
  var CName = reqs.CName;
  var Address = reqs.Address;
  let sql = "INSERT into communities (cName, address) VALUES (?,?);";
  let vals = [CName, Address];
  con.query(sql, vals, function (err, result) {
    let sqlid = "SELECT LAST_INSERT_ID() as comm_id";

    con.query(sqlid, (err, result) => {
      if (err) throw err;

      var comm_id = result[0].comm_id;
      let sqllink = "INSERT into communities_has_users (communities_id, users_id, role) VALUES (?,?, 1);";
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
  `SELECT communities_has_users.communities_id as id, communities.cName as 'name'
  FROM communities_has_users 
  INNER JOIN communities ON communities_has_users.communities_id = communities.id
  WHERE users_id = ?;`
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
      "INSERT into users (userName, userPassword, email, firstName, lastName, birthday) VALUES (?,?,?,?,?,?)";
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

  let loginquery = "SELECT id, userPassword FROM users WHERE userName = ?;";
  let vals = [userName];

  con.query(loginquery, vals, function (sqlerr, result) {
    if (sqlerr) {
      res.status(500);
    } else {
      // console.log(result[0]);
      let hash = result[0].userPassword;
      bcrypt.compare(userPassword, hash, function (err, bres) {
        if (bres) {
          console.log("Valid login");
          var user_id = result[0].id;
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

  req.session.destroy(function (err) {
    res.redirect("/login"); //Inside a callback
    // req.clearCookie();
  });

});

router.get('/search', function (req, res) {
  var data = [];
  con.query('SELECT id, cName, address from communities where cName like "%' + req.query.key + '%" OR address like "%' + req.query.key + '%"', function (err, rows, fields) {
    if (err) throw err;
    for (i = 0; i < rows.length; i++) {
      // console.log(result);
      data.push({
        ID: rows[i].id,
        Name: rows[i].cName,
        Address: rows[i].address
      });
    };
    res.send(data);
  });
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