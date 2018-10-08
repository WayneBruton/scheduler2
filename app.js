const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var connection = require('./routes/connection');
var bcrypt = require('bcrypt');


var session = require('express-session');
var passport = require('passport');
var MySQLStore = require('express-mysql-session')(session);
var LocalStrategy = require('passport-local').Strategy;

var clientRoutes        = require('./routes/clients'),
    dashboardRoutes      = require('./routes/dashboard'),
    carerRoutes         = require('./routes/carers'),
    indexRoutes         = require('./routes/index'),
    shiftRoutes         = require('./routes/shifts'),
    timesheetRoutes     = require('./routes/timesheets'),
    reportRoutes        = require('./routes/reports'),
    graphRoutes         = require('./routes/graph'),
    adminRoutes         = require('./routes/admin'),
    registerRoutes      = require('./routes/register');




app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());//immedietely after body parser
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, 'public')));


var options = {
    host: 'localhost',
    user: 'root',
    database: 'scheduler',
    password: '12071994W!',
    multipleStatements: true //for more than one query in a get route
  };
  
  var sessionStore = new MySQLStore(options);
  
  
  
  app.use(session({
    secret: '12fgsgsdfadfafafasfss',
    resave: false,
    store: sessionStore,
    saveUninitialized: false
    // cookie: { secure: true }
  }))

  app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    function(username, password, done) {
        // console.log(username);
        // console.log(password);

  
        connection.query('select id, password from users where username = ?', [username], function(err, results, fields){
          if (err) { done(err)};
          if (results.length === 0) {
            done(null, false);
          } else {
            const hash = results[0].password.toString();
            var user_id = results[0].id;
  
            bcrypt.compare(password, hash , function(err, response){
              if (response) {
                return done(null, {user_id: user_id});
              } else {
                return done(null, false);
              };
            });
          };
        }); 
      }));




app.use(indexRoutes);




app.use(dashboardRoutes);
app.use(carerRoutes);
app.use(clientRoutes);
app.use(shiftRoutes);
app.use(timesheetRoutes);
app.use(reportRoutes);
app.use(graphRoutes);
app.use(adminRoutes);
app.use(registerRoutes);


// process.env.PORT
app.listen(process.env.PORT, process.env.IP, function(){
    console.log(`Wayne's server started.....`);
});



// var options = {
//   host: 'localhost:3306',
//   user: 'eccentri_root',
//   database: 'eccentri_scheduler',
//   password: '12071994Wb!@',
//   multipleStatements: true //for more than one query in a get route
// };

