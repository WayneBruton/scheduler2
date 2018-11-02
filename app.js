const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var moment = require('moment-timezone');

const port = process.env.PORT || 3000;

const portExport = {
  port: 9999
}
module.exports = portExport;
if (port === 3000) {
  require('dotenv/config');
}

var pool = require('./routes/connection');
var bcrypt = require('bcryptjs');



console.log(moment.tz.guess());


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
    registerRoutes      = require('./routes/register'),
    forgotPasswordRoutes      = require('./routes/forgotpassword');




app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());//immedietely after body parser
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, 'public')));


var options = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    // password: '12071994W!',
    multipleStatements: true //for more than one query in a get route
  };
  
  var sessionStore = new MySQLStore(options);
  
  
  
  app.use(session({
    secret: process.env.SESSION_SECRET,
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

        pool.getConnection(function(err, connection){
          if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
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
              connection.release();
              
            })
          });
        })
        );
        




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
app.use(forgotPasswordRoutes);

// console.log(port);


// process.env.PORT
app.listen(port, process.env.IP, function(){
    console.log(`Wayne's server started.....`);
});


// console.log(portExport);
// console.log(module.exports);





