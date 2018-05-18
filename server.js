const mysql = require('mysql');
const express = require('express');
const parser = require('body-parser');

var indexRouter = require('./routes/routes');

const app = express();

  //initialize session variable

app.use('/', indexRouter);


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

app.listen(3000, '0.0.0.0', () => console.log("Example app listening to port 3000"));