var express = require('express');
var router = express.Router();
var connection = require('./connection');
var expressValidator = require('express-validator');


var bcrypt = require('bcrypt');
var passport = require('passport');

const  { authenticationMiddleware } = require('./middleware');

var saltRounds = 10;


router.get('/register',authenticationMiddleware(), function(req, res){
    var viewjs = '../public/js/register.js';
    var viewcss = '../public/styles/register.css';
    res.render('register', {errors: '',viewjs: viewjs, viewcss: viewcss});
});

router.post('/register', function(req, res, next) {
    req.checkBody('username', 'Username field cannot be empty.').notEmpty();
    req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
    req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
    req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
    req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
    req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);

    const errors = req.validationErrors();
    console.log('==============');

    if (errors) {
        console.log(`errors: ${JSON.stringify(errors)}`);
        var viewjs = '../public/js/register.js';
        var viewcss = '../public/styles/register.css';
        res.render('register', { 
            title: 'Registration Error',
            errors: errors,
            viewjs: viewjs, 
            viewcss: viewcss
        });
      } else {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        // console.log(username);
        // console.log(email);
        // console.log(password);

        var sql = `INSERT INTO USERS (username, email, password) values (? , ? , ?)`;

        bcrypt.hash(password, saltRounds, function(err, hash) {
                // console.log(hash);

                connection.query(sql, [username, email, hash] , function(error, results, fields){
                    if (error) throw error;
                    connection.query('SELECT LAST_INSERT_ID() AS user_id', function(error, results, fields){
                      if (error) throw error;
          
                      const user_id = results[0];
                      console.log(user_id);
                      req.login(user_id, function(err){
                        res.redirect('/admin');
                      })
          
                    });
                });
        });
    }
});
 
router.get('/checkusernames/:username', function(req, res){
    var username = req.params.username;
    // console.log(username);
    var sql = `SELECT username from users where username = '${username}'`;
    connection.query(sql, function(error, results, fields){
        if (error) throw error; 
        if (results.length > 0) {
            res.send(results[0].username);
        }
        // console.log(results[0].username);
        // res.send(results[0].username);
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }));

  router.get('/logout',  function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });



passport.serializeUser(function(user_id, done) { //Write to session
    done(null, user_id);
  });
  
  passport.deserializeUser(function(user_id, done) { //Read from session
      done(null, user_id);
  
  });
  
// function authenticationMiddleware() {  
//       return (req, res, next) => {
//           console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
  
//           if (req.isAuthenticated()) return next();
//           res.redirect('/login')
//       }
//   }



module.exports =  router;
