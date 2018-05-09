const mysql = require('mysql');
const express = require('express');
const parser = require('body-parser');

var session = require('express-session');

var indexRouter = require('./routes/routes');

const app = express();

  //initialize session variable

app.use('/', indexRouter);

app.use(session({
    secret: 'bigsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))



// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

app.use(parser.urlencoded({extended : true}));

app.use(express.static('public'));

app.listen(3000, () => console.log("Example app listening to port 3000"));


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