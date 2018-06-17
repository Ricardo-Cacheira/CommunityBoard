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
  database: "bdnetwork",
  multipleStatements: true
});
//RdSQL1At365d.
//MreZ39lpdSql

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
  res.redirect('/profile');
});

//get personal events
router.get("/todo", authenticationMiddleware(), function (req, res) {
  let page_title = "To-Do List";
  let getUEvents = `
  SELECT users_has_events.events_id, events.id, events.description, (SELECT DATE_FORMAT(events.date, "%W %b %e %Y - %H:%i")) AS date
  FROM events
  INNER JOIN users_has_events ON events.id = users_has_events.events_id
  WHERE users_id = ?  AND date > NOW()
  ORDER BY events.date  ASC;`;

  con.query(getUEvents, req.user, function (err, result) {
    if (err) throw err;
    let events = result;

    let notifs;
    let getnot = `
    SELECT posts_id as id
    FROM notifications
    WHERE users_id = ? AND highlight = 1 AND muted = 0
    `;
    var val = [req.user];
    con.query(getnot, val, function (err, result2, fields) {
      if (err) throw err;
      notifs = result2;
    });

    getCommunityList(req.user, function (err, result) {
      if (err) {
        res.send(500);
      } else {
        let communityList = result;
        res.render("todo", {
          page_title,
          events,
          communityList,
          notifs
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

router.post('/insertComEvent', function (req, res) {
  var reqs = req.body;
  var description = reqs.description;
  var date = reqs.date;
  var communityID = reqs.comID;

  let newEvent = 'INSERT INTO events (description, date) VALUES (?, ?);';
  let vals = [description, date]
  con.query(newEvent, vals, function (err, result) {
    if (err) throw err;
    let eventOwner = 'INSERT INTO communities_has_events (communities_id, events_id) VALUES (?, ?);';


    let comvals = [communityID, result.insertId]
    con.query(eventOwner, comvals, function (err, result) {
      if (err) {
        throw err;
      } else {
        res.redirect('/feed/' + communityID);
      }
    });
  });
});

router.post('/insertAcceptedEvent', authenticationMiddleware(), function (req, res) {
  var reqs = req.body;
  var iduser = reqs.iduser;
  var idevent = reqs.idevent;

  let check = 'Select * from users_has_events where users_id = ? AND events_id = ?'
  let acceptEvent = 'INSERT INTO users_has_events (users_id, events_id) VALUES (?, ?);';
  let vals = [iduser, idevent]


  con.query(check, vals, function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      if (result.length > 0) {
        console.log("Already added");
        res.send(false);
      } else {
        con.query(acceptEvent, vals, function (err, result) {
          if (err) throw err;
          res.redirect('/todo');
        });
      }
    }
  });
});

//delete personal events -- todo (:)
router.post('/deleteTodo', function (req, res) {
  var reqs = req.body;
  var todoId = reqs.idtodo;

  var vals = [todoId, req.user];
  console.log(vals);

  let deleteTodoOwner = 'DELETE FROM users_has_events WHERE events_id = ? AND users_id = ?;';

  con.query(deleteTodoOwner, todoId, function (err, result) {
    if (err) throw err;
    res.redirect('/todo');
  });
});

//get profile (info and accepts)
router.get("/profile", authenticationMiddleware(), function (req, res) {
  let page_title = 'Profile';
  let selectProfile = `SELECT * FROM users WHERE id= ?;`;

  con.query(selectProfile, req.user, function (err, result) {
    let userinfo = result[0];

    let selectPosts = `SELECT posts.id, posts.content, 
      (SELECT COUNT(*) FROM accepts WHERE posts_id = posts.id AND users_id != ? AND accepted != 1) AS acceptCount
      FROM posts 
      WHERE posts.users_id = ?
      HAVING acceptCount != 0;`;

    let vals = [req.user, req.user]
    con.query(selectPosts, vals, function (err, result) {
      let accepts = result;

      let notifs;
      let getnot = `
      SELECT posts_id as id
      FROM notifications
      WHERE users_id = ? AND highlight = 1 AND muted = 0
      `;
      var val = [req.user];
      con.query(getnot, val, function (err, result2, fields) {
        if (err) throw err;
        notifs = result2;
      });

      let info;
      let getinfo = `
      SELECT posts_id as id, posts.content
      FROM notifications
      INNER JOIN posts ON notifications.posts_id = posts.id
      WHERE notifications.users_id = ? AND highlight = 1 AND muted = 0;
      `;
      con.query(getinfo, val, function (err, result3, fields) {
        if (err) throw err;
        info = result3;
      });

      getCommunityList(req.user, function (err, result) {
        let communityList = result;
        res.render("profile", {
          page_title,
          userinfo,
          accepts,
          communityList,
          notifs,
          info
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
    let updateuser = `UPDATE users SET userName = '` + userName + `', email = '` + email + `', firstName = '` + firstName + `', lastName = '` + lastName + `' WHERE id= ?;`;
    let vals = [req.user];
    con.query(updateuser, vals, function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log('User info updated')
        res.redirect('/profile')
      }
    });
  });
});

router.get('/acceptHelp', authenticationMiddleware(), function (req, res) {
  let accepth = `SELECT content, date, id FROM posts WHERE users_id = '?';`;
  let vals = [req.user];

  con.query(accepth, vals, function (err, result) {
    if (err) throw err;
    res.render("community", {
      page_title,
      community,
      feed,
      communityList
    });
  });
});

router.post("/chooseUser", function (req, res) {
  let pid = req.body.pid;
  let uid = req.body.uid;
  let vals = [uid, pid];
  let checkAccepts = `SELECT * FROM accepts WHERE accepted = 1 AND posts_id = ?;`;
  let chooseAccept = `UPDATE accepts SET accepted = 1 WHERE users_id = ? AND posts_id = ?;`;

  con.query(checkAccepts, pid, function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      if (result.length > 0) {
        console.log("Selected accepts");
        res.send(false);
      } else {
        con.query(chooseAccept, vals, function (err, result, fields) {
          if (err) throw err;
          let updateUserScore = `UPDATE users SET UserScore = UserScore + 250 WHERE id = ?;`;

          con.query(updateUserScore, uid, function (err, result) {

            if (err) throw err;
            console.log("Chose a user");
            res.send(true);
          })


        });
      }
    }
  });
});

// router.post('/')

//create community

router.post("/newp", authenticationMiddleware(), function (req, res) {
  let community = req.body.comID;
  var post;
  // console.log(community);
  let newp = 'INSERT into posts (`users_id`, `content`, `date`, end, `communities_id`) VALUES ( ?, ?, NOW(), ?, ?)';
  var vals = [req.user, req.body.content, req.body.end, community];
  con.query(newp, vals, function (err, result, fields) {
    if (err) throw err;
    console.log("You posted something");

    let ret = `
    SELECT users.firstName, users.lastName, users.userName, users.userScore, users.Birthday, users.Photo, posts.content,(SELECT DATE_FORMAT(posts.date, "%H:%i - %d/%m/%Y")) AS 'date',(SELECT DATE_FORMAT(posts.end, "%H:%i - %d/%m/%Y")) AS 'end', posts.id,
    (SELECT accepts.users_id FROM accepts where users_id = ? AND posts_id = posts.id) AS accepted
    FROM posts
    INNER JOIN  users ON posts.users_id = users.id
    Where posts.id = ?
    `;
    var val = [req.user, result.insertId];
    con.query(ret, val, function (err, result2, fields) {
      if (err) throw err;
      post = result2[0];
      req.app.io.emit("post", {
        userName: post.userName,
        firstName: post.firstName,
        lastName: post.lastName,
        date: post.date,
        end: post.end,
        content: post.content,
        id: post.id,
        accepted: "",
        cid: community
      });
      let addNotifs = `INSERT INTO notifications (users_id, posts_id) VALUES (?, ?);`;
      let not = [req.user, post.id];
      con.query(addNotifs, not, function (err, result, fields) {
        if (err) throw err;
        console.log("notification record created");
      });
    });
  });
  res.send(true);
  // res.redirect("/feed/" + community);
});

router.get("/feed/:Community", authenticationMiddleware(), function (req, res) {
  var reqs = req.params;
  let community = reqs.Community;
  let belongs, role, requests, communityName, members, comEvents;
  let page_title = "Community " + community + " Feed";
  let SELECT_posts =
    `
    SELECT users.firstName, users.lastName, users.userName, users.userScore, users.Birthday, users.Photo, posts.content,(SELECT DATE_FORMAT(posts.date, "%d/%m/%Y - %H:%i")) AS 'date',(SELECT DATE_FORMAT(posts.end, "%d/%m/%Y - %H:%i")) AS 'end', posts.id,
    (SELECT accepts.users_id FROM accepts where users_id = ? AND posts_id = posts.id) AS accepted
    FROM posts
    INNER JOIN  users ON posts.users_id = users.id
    Where communities_id = ? AND end > NOW()
    ORDER BY posts.end ASC;
    `;
  let vals = [req.user, community];
  con.query(SELECT_posts, vals, function (err, result, fields) {
    if (err) throw err;

    var feed = result;

    let check = "SELECT * FROM communities_has_users where users_id = ? AND communities_id = ?;";

    con.query(check, vals, function (err, result, fields) {
      if (result.length > 0) {
        belongs = true;
        role = result[0].role;
      } else {
        belongs = false;
      }
    });

    let reqJoin = `
    SELECT users.firstName, users.lastName, users.userName, users.id
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
    select users.firstName, users.lastName, users.userName, users.id, communities_has_users.role as role
    FROM communities_has_users
    INNER JOIN  users ON communities_has_users.users_id = users.id
    Where communities_id = ?;
    `;

    con.query(memberList, community, function (err, result, fields) {
      members = result;
    });

    let cevents = `
    SELECT communities_has_events.events_id, events.id, events.description, (SELECT DATE_FORMAT(events.date, "%W %b %e %Y - %H:%i")) AS date
    FROM events
    INNER JOIN communities_has_events ON events.id = communities_has_events.events_id
    WHERE communities_has_events.communities_id = ?  AND date > NOW()
    ORDER BY events.date ASC;`;
    con.query(cevents, community, function (err, result, fields) {
      comEvents = result;

    });

    let notifs;
    let getnot = `
    SELECT posts_id as id
    FROM notifications
    WHERE users_id = ? AND highlight = 1 AND muted = 0
    `;
    var val = [req.user];
    con.query(getnot, val, function (err, result2, fields) {
      if (err) throw err;
      notifs = result2;
    });

    getCommunityList(req.user, function (err, result) {
      if (err) {
        res.send(500);
      } else {

        let communityList = result;
        res.render("community", {
          community,
          feed,
          communityList,
          belongs,
          role,
          requests,
          communityName,
          members,
          comEvents,
          userId: req.user,
          notifs
        });
      }
    });
  });
});

router.get("/post/:idp", authenticationMiddleware(), function (req, res) {
  var reqs = req.params;
  let belongs, role, requests, communityName, members, comEvents;
  let postId = reqs.idp;
  let userId = req.user;
  let SELECT_posts = `
    SELECT users.firstName, users.lastName, users.userName, posts.content, (SELECT DATE_FORMAT(posts.date, "%d/%m/%Y - %H:%i")) AS 'date', (SELECT DATE_FORMAT(posts.end, "%d/%m/%Y - %H:%i")) AS 'end', posts.communities_id, posts.users_id
    FROM posts
    INNER JOIN  users ON posts.users_id = users.id
    Where posts.id = ?;
    `;
  con.query(SELECT_posts, postId, function (err, result, fields) {
    if (err) throw err;

    var post = result[0];
    let page_title = post.content;
    let community = post.communities_id;
    let SELECT_comments = `
    SELECT text,(SELECT DATE_FORMAT(date, "%H:%I - %d/%m/%Y")) AS 'date',users.userName, comments.id
    FROM comments
    INNER JOIN  users ON comments.users_id = users.id
    Where posts_id = ?
    ORDER BY comments.date DESC;
    `;

    con.query(SELECT_comments, postId, function (err, result2, fields) {
      if (err) throw err;
      var comments = result2;

      let SELECTAccepts = `
      SELECT accepts.id, users.firstName, users.lastName, users.userName, accepts.users_id
      FROM accepts
      INNER JOIN users ON accepts.users_id = users.id
      WHERE posts_id = ?;
      `;

      con.query(SELECTAccepts, req.params.idp, function (err, result3, fiels) {
        // console.log('Result 3 ' + JSON.stringify(result3));
        var accepts = result3;

        let check = "SELECT * FROM communities_has_users where users_id = ? AND communities_id = ?;";
        let vals = [req.user, community];
        con.query(check, vals, function (err, result, fields) {
          if (result.length > 0) {
            belongs = true;
            role = result[0].role;
          } else {;
            belongs = false;
          }
        });

        let reqJoin = `
      SELECT users.firstName, users.lastName, users.userName, users.id
      FROM requests
      INNER JOIN  users ON requests.users_id = users.id
      Where communities_id = ?;
      `;

        con.query(reqJoin, community, function (err, result, fields) {
          requests = result;
        });

        let cominfo = `select * FROM communities Where id = ?;`;

        con.query(cominfo, community, function (err, result, fields) {
          // console.log(result);
          communityName = result[0].cName;
        });

        let memberList = `
      select users.firstName, users.lastName, users.userName, users.id, communities_has_users.role as role
      FROM communities_has_users
      INNER JOIN  users ON communities_has_users.users_id = users.id
      Where communities_id = ?;
      `;

        con.query(memberList, community, function (err, result, fields) {
          members = result;
        });

        let cevents = `
    SELECT communities_has_events.events_id, events.id, events.description, (SELECT DATE_FORMAT(events.date, "%W %b %e %Y - %H:%i")) AS date
    FROM events
    INNER JOIN communities_has_events ON events.id = communities_has_events.events_id
    WHERE communities_has_events.communities_id = ?  AND date > NOW()
    ORDER BY events.date  ASC;`;
        con.query(cevents, community, function (err, result, fields) {
          comEvents = result;

        });

        let removeNot = `UPDATE notifications SET highlight= 0 WHERE posts_id = ? and users_id=?;`;
        var rval = [postId, req.user];
        con.query(removeNot, rval, function (err, result, fields) {
          if (err) throw err;
        });

        let notifs;
        let getnot = `
        SELECT posts_id as id
        FROM notifications
        WHERE users_id = ? AND highlight = 1 AND muted = 0
        `;
        var val = [req.user];
        con.query(getnot, val, function (err, result2, fields) {
          if (err) throw err;
          notifs = result2;
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
              accepts,
              belongs,
              role,
              requests,
              communityName,
              members,
              userId,
              comEvents,
              notifs
            });
          }
        });
      });
    });
  });
});

router.get("/test", function (req, res) {
  let test = `Select * From users; Select * From communities;`;
  con.query(test, function (err, result, fields) {
    if (err) throw err;
    console.log("You commented something");
    console.log(result);
  });
});

router.post("/newc", authenticationMiddleware(), function (req, res) {
  let post = req.body.postID;
  let comment;

  let newc = 'INSERT into comments (`text`, `date`, `users_id`, `posts_id`) VALUES (?, NOW(), ?, ?)';
  let vals = [req.body.content, req.user, post];
  con.query(newc, vals, function (err, result, fields) {
    if (err) throw err;
    comment_id = result.insertId;
    console.log("You commented something", result.insertId);

    let ret = `
    SELECT users.userName as uName, (SELECT DATE_FORMAT(date, "%H:%i - %d/%m/%Y")) as 'date', text, posts_id
    FROM comments as c
    INNER JOIN users on users.id = c.users_id
    WHERE c.id = ?;
    `;
    con.query(ret, result.insertId, function (err, result2, fields) {
      if (err) throw err;
      comment = result2[0];
      console.log("uname", result2[0].uName);
      req.app.io.emit("comment", {
        uName: comment.uName,
        date: comment.date,
        comm: comment.text,
        id: post
      });

      let idpost = Number(post);

      let checkNotifs = `SELECT * FROM notifications WHERE users_id = ? AND posts_id = ?;`;
      let addNotifs = `INSERT INTO notifications (users_id, posts_id) VALUES (?, ?);`;
      let not = [req.user, idpost];
      con.query(checkNotifs, not, function (err, result, fields) {
        if (err) {
          throw err;
        } else {
          if (result.length > 0) {
            console.log("already has notification record");
          } else {
            con.query(addNotifs, not, function (err, result, fields) {
              if (err) throw err;
              console.log("notification record created");
            });
          }
        }
      });
      let updateNotifs = `UPDATE notifications SET highlight = 1 WHERE users_id != ? AND posts_id = ?;`;
      con.query(updateNotifs, not, function (err, result, fields) {
        if (err) {
          throw err;
        }else{
          req.app.io.emit("info", {
            id: idpost, content: req.body.content
          });

          req.app.io.emit("notif", {
            id: idpost
          });
        }
      });
    });
  });
  res.send(true);
});

router.post("/accept", function (req, res) {
  let post = req.body.idpost;
  let check = "SELECT * FROM accepts where users_id = ? AND posts_id = ?;";
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
  let check = "SELECT * FROM communities_has_users where communities_id = ? AND users_id = ?;";
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
  let check = "SELECT * FROM requests where users_id = ? AND communities_id = ?;";
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

router.post("/leave", function (req, res) {
  let com = req.body.com;
  let check = "SELECT * FROM communities_has_users where users_id = ? AND communities_id = ?;";
  let newr = 'DELETE FROM communities_has_users where users_id = ? AND communities_id = ?;';
  let vals = [req.user, com];

  con.query(check, vals, function (err, result, fields) {
    if (result.length < 0) {
      res.send(false);
    } else {
      con.query(newr, vals, function (err, result, fields) {
        if (err) throw err;
        res.send(true);
      });
    }
  });
});

router.post("/kick", function (req, res) {
  let com = req.body.com;
  let user = req.body.user;
  let check = "SELECT * FROM communities_has_users where users_id = ? AND communities_id = ?;";
  let newr = 'DELETE FROM communities_has_users where users_id = ? AND communities_id = ?;';
  let vals = [user, com];

  con.query(check, vals, function (err, result, fields) {
    if (result.length < 0) {
      res.send(false);
    } else {
      con.query(newr, vals, function (err, result, fields) {
        if (err) throw err;
        res.send(true);
      });
    }
  });
});

router.post("/promote", function (req, res) {
  let com = req.body.com;
  let user = req.body.user;
  let check = "SELECT * FROM communities_has_users WHERE users_id = ? AND communities_id = ?;";
  let newr = 'UPDATE communities_has_users SET role = 1 WHERE users_id = ? AND communities_id = ?;';
  let vals = [user, com];

  con.query(check, vals, function (err, result, fields) {
    if (result.length < 0) {
      res.send(false);
    } else {
      con.query(newr, vals, function (err, result, fields) {
        if (err) throw err;
        res.send(true);
      });
    }
  });
});


router.post("/demote", function (req, res) {
  let com = req.body.com;
  let user = req.body.user;
  let check = "SELECT * FROM communities_has_users WHERE users_id = ? AND communities_id = ?;";
  let newr = 'UPDATE communities_has_users SET role = 0 WHERE users_id = ? AND communities_id = ?;';
  let vals = [user, com];

  con.query(check, vals, function (err, result, fields) {
    if (result.length < 0) {
      res.send(false);
    } else {
      con.query(newr, vals, function (err, result, fields) {
        if (err) throw err;
        res.send(true);
      });
    }
  });
});

router.get("/createCommunity", authenticationMiddleware(), function (req, res) {
  let page_title = "Create YOUR Community"
  let notifs;
  let getnot = `
    SELECT posts_id as id
    FROM notifications
    WHERE users_id = ? AND highlight = 1 AND muted = 0
    `;
  var val = [req.user];
  con.query(getnot, val, function (err, result2, fields) {
    if (err) throw err;
    notifs = result2;
  });
  getCommunityList(req.user, function (err, result) {
    if (err) {
      res.send(500);
    } else {
      let communityList = result;
      res.render("createCommunity", {
        page_title,
        communityList,
        notifs
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
    let sqlid = "SELECT LAST_INSERT_ID() AS comm_id";

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
      let sql = "SELECT LAST_INSERT_ID() AS user_id";

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
          res.redirect("/profile");
        });
      });
    });
  });
});

//login
router.post("/SELECTLogin", function (req, res) {
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
            res.redirect("/profile");
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
  con.query('SELECT id, cName, address FROM communities where cName like "%' + req.query.key + '%" OR address like "%' + req.query.key + '%"', function (err, rows, fields) {
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

//retrieving user dataFROM the session
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