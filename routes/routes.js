const router = require('express').Router();
const mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "RdSQL1At365d.",
    database: "bdnetwork"
  });
  
  router.get('/insertUser/:UserName/:UserPassword/:Email/:FirstName/:LastName/:Birthday', insert);
  
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
         
      } 
      else  if (result[0] != "") {
        console.log("Invalid login");
        
      }
    });
  };
  
  
  //routes
  router.post('/newp', function(req,res){
    console.log(req.body);
  
    let sql2 = "INSERT into Posts (PosterID, Content, PostDate) VALUES (1, '" + req.body.content + "', NOW())";
  
    console.log("we allmost there");
    con.query(sql2, function (err, result, fields) {
      if (err) throw err;
      console.log("you posted something");
    });
    
    res.sendFile(__dirname + '/public/community.html');
  });
  
  router.get('/feed', function(req,res){
    let page_title = "Testing";
    let select_posts = `
    select users.FirstName, users.LastName, users.UserName, posts.Content, posts.PostDate
    FROM Posts
    INNER JOIN  users ON posts.PosterID = users.ID;
    `;
    con.query(select_posts, function (err, result, fields) {
      if (err) throw err;
      
      var feed = result;
      res.render("index", {page_title, feed});
    });
  });
  
  router.post('/other', function(req,res){
    res.sendFile(__dirname + '/public/newpost.html');
  });
  
  router.get('/view', function(req, res) {
    let page_title = "Testing";
    let select_posts = `
    select users.FirstName, users.LastName, users.UserName, posts.Content, posts.PostDate
    FROM Posts
    INNER JOIN  users ON posts.PosterID = users.ID;
    `;
    con.query(select_posts, function (err, result, fields) {
      if (err) throw err;
      
      var feed = result;
      res.render("index", {page_title, feed});
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
router.get('/google',(req, res) => {
    //handle with passport
    res.send("logging in with google");
});

  //verification END --------------------------------


module.exports = router;