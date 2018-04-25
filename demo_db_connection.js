const mysql = require('mysql');
const express = require('express');
const parser = require('body-parser');

const app = express();

app.use(parser.urlencoded({extended : true}));

app.listen(3000, () => console.log("Example app listening to port 3000"));

app.use(express.static('public'));
 
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "RdSQL1At365d.",
  database: "bdnetwork"
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

  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log("1 record inserted");

  });
};

//login
app.get('/selectLogin/:UserName/:UserPassword/', login);

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
       
    } 
    else  if (result[0] != "") {
      console.log("Invalid login");
      
    }
  });
};


//routes
app.post('/newp', function(req,res){
  console.log(req.body);

  let sql2 = "INSERT into Posts (PosterID, Content, PostDate) VALUES (1, '" + req.body.content + "', NOW())";

  console.log("we allmost there");
  con.query(sql2, function (err, result, fields) {
    if (err) throw err;
    console.log("you posted something");
  });
  
  res.sendFile(__dirname + '/public/community.html');
});

var feed_header = `
  <!DOCTYPE html>
  <html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Community feed</title>
      <link rel="stylesheet" href="main.css">
      <link rel="stylesheet" href="community.css">
  </head>

  <body>

      <div id="navbar">
          <ul>
              <li>
                  <div class="dropdown">
                      <button onclick="myFunction()" class="dropbtn">Communities</button>
                      <div id="myDropdown" class="dropdown-content">
                          <a href="community.html">Community X</a>
                      </div>
                  </div>
                  <!-- <a class="active" href="#intro">Communities</a> -->
              </li>
              <li>
                  <a href="calendar.html">Calendar</a>
              </li>
              <li>
                  <a href="#profile">Profile</a>
              </li>
              <li>
                  <a href="index.html">Index</a>
              </li>
              <li style="float:right">
                  <a href="register.html">Register</a>
              </li>
              <li style="float:right">
                  <a href="login.html">Log in</a>
              </li>
          </ul>
      </div>
`;

var feed_sidebar = `
  <div class="left" id="sidebar">
  <img class="profile-pic" src="buildding.png" />
  <p class="name">Prédio azul</p>
  <p class="bio">
      Grupo do prédio azul Cenas e tal, dhfdsfhds kfjsdvgoj rh tgjaehg etsgubitra jrtb sthwr hrth st eht htrtwhthh hrthrthrtgurhkhfehosehvuhle
      hug evgkjh gorhgerhg rgherghkhg4e geg et er regergerg er geg er geg ergre e
  </p>

  <form method="POST" action="/other">
      <button id="new">NEW POST</button>
  </form>
  </div>

  <div class="right" id="feed">
  <ul>
`;

var feed_end = `
  </ul>
  </div>

  <script src="main.js"></script>
  </body>

  </html>
`;

app.get('/feed', function(req,res){
  var feed ="";
  var select_posts = `
  select users.FirstName, users.LastName, users.UserName, posts.Content, posts.PostDate
  FROM Posts
  INNER JOIN  users ON posts.PosterID = users.ID;
  `;
  con.query(select_posts, function (err, result, fields) {
    if (err) throw err;
    
    for (let i = 0; i < result.length; i++) {
      var post ="";
      var element = result[i];

      console.log(element);
      post = `
      <li class="post">
          <article class="post-content">
              <p class="post-name">`+element.FirstName+ ` `+ element.LastName+`</p>
              <p class="post-info">`+element.UserName+ ` `+ element.PostDate+`</p>
              <p class="post-text">`+element.Content+`</p>
          </article>
          <section class="post-reactions">
              <div class="accept">0 Accepts</div>
              <div class="post-comment">0 Comments</div>
          </section>
      </li>
      <br>
      <br>
      `
      // console.log(result[i]);
      // console.log(element.UserName);
      feed += post;
    }
    res.send(feed_header + feed_sidebar + feed + feed_end);
  });
});

app.post('/other', function(req,res){
  res.sendFile(__dirname + '/public/newpost.html');
});



//------------------------ Testing code -------------------------------------------------------------------------------

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("You are now connected");
//   con.query("SELECT id, username FROM Users", function (err, result, fields) {
//     if (err) throw err;

//     for (var i in result) {
//       console.log('userid', result[i].id);
//   };
// });
// });


// if (result.ID == null) {
//   console.log("Wrong Login");
//   console.log(result);
// }
// else {
//   console.log(result);
//   console.log("Valid login");
// }
//if this != null;

//create var session which stores id

// init 
// session = new NodeSession({secret: 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD'});

// const user = {
//   username: 'test-user',
//   passwordHash: 'bcrypt-hashed-password',
//   id: 1
// }

// passport.use(new LocalStrategy(
//  (username, password, done) => {
//     findUser(username, (err, user) => {
//       if (err) {
//         return done(err)
//       }

//       // User not found
//       if (!user) {
//         return done(null, false)
//       }

//       // Always use hashed passwords and fixed time comparison
//       bcrypt.compare(password, user.passwordHash, (err, isValid) => {
//         if (err) {
//           return done(err)
//         }
//         if (!isValid) {
//           return done(null, false)
//         }
//         return done(null, user)
//       })
//     })
//   }
// ))

// function authenticationMiddleware () {
//   return function (req, res, next) {
//     if (req.isAuthenticated()) {
//       return next()
//     }
//     res.redirect('/')
//   }
// }

// app.get('/profile', passport.authenticationMiddleware(), renderProfile)

// app.use(session({
//   store: new mysql({
//   url: config.mysql.url
//   }),
//   secret: config.redisStore.secret,
//   resave: false,
//   saveUninitialized: false
// }))
// app.use(passport.initialize());
// app.use(passport.session());

// con.connect(function(err) {
//   if (err) throw err;
//   con.query("SELECT * FROM Users", function (err, result, fields) {
//     if (err) throw err;
//     console.log(result);
//   });
// });
// con.connect(function(err) {
//   if (err) throw err;
//   con.query("SELECT id, username FROM Users", function (err, result, fields) {
//     if (err) throw err;
//     console.log(result[1].id);
//     req.session.put('userid', result[1].id);
//   });
// });


// if (req.session.has('userid'))
// {
//     // 
// // Removing All Items From The Session
// req.session.flush();

// // Retrieving All Data From The Session
// var data = req.session.all();

// // Retrieving An Item Or Returning A Default Value
// var value = req.session.get('key', 'default');

//Module dependencies
// var mysql = require('mysql');
// var express = require('express');
// // var expresssession = require('express-session');
// // var expressValidadtor = require('express-validator')
// // var MySQLStore = require('express-mysql-session')(session);
// var app = express();

// // app.use(expressValidator());
// // app.use(expressSession({secret: 'max', saveUninitialized: false, resave:false}));

// // app.use(session({secret:'XASDASDA'}));
// // app.get('/',function(req,res) { 
// //   ssn = req.session; 
// //   if(ssn.email) {
// //     res.redirect('calendar.html');
// //   } else {
// //     res.render('index.html');
// //   }
// // });
// // app.post('/login',function(req,res){
// //   ssn = req.session;
// //   ssn.email=req.body.email;
// //   res.end('done');
// // });
// // app.get('/admin',function(req,res){
// //   ssn = req.session;
// //   if(ssn.email) {
// //     res.write('<h1>Hello '+ssn.email+'</h1>');
// //     res.end('<a href="+">Logout</a>');
// //   } else {
// //     res.write('<h1>login first.</h1>');
// //     res.end('<a href="+">Login</a>');
// //   }
// // });
// // app.get('/logout',function(req,res){
// //   req.session.destroy(function(err) {
// //     if(err) {
// //       console.log(err);
// //     } else {
// //       res.redirect('/');
// //     }
// //   });
// // });
// // app.use(session());



// app.listen(3000, () => console.log("Example app listening to port 3000"));

// app.use(express.static('public'));

// //App initialization
// var connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'MreZ39lpdSql',
//   port: '3306',
//   database: 'bdnetwork'

// });

// start session for an http request - response 
// this will define a session property to the request object 
// session.startSession(req, res, callback);

//   var query = 'SELECT * FROM Users';
 
//   query.on('result', function(row) {
//     console.log(row.post_title);
// });
// // query.on(queryString, function(err, result, fields) {
// //     if (err) throw err;
 
// //     for (var i in result) {
// //         console.log('Post Titles: ', result[i].id);
// //     }
// // });
//   connection.end();

//   // connection.query("SELECT * FROM Users", function (err, result, fields) {
//   //   if (err) throw err;
//   //   console.log(result);
//   // });

//   // connection.query("SELECT ID FROM Users", function (err, result, fields) {
//   //   if (err) throw err;
//   //   console.log(result);
//   // });

//   // connection.query("SELECT ID FROM Users", function (err, result, fields) {
//   //   if (err) throw err;
//   //   console.log(result);
//   // });