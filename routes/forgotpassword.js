var express = require('express');
var router = express.Router();
var pool = require('./connection');
// var moment = require('moment-timezone');

router.get('/forgot', function(req, res){
    res.render('forgot');
});

// const resetToken;

router.get('/resetpassword/:username/:userEmail', function(req, res){
    var response = {
        success : 'Success',
        failure: 'There was a problem',
        error: 'Failure'
    }
    var username = req.params.username;
    console.log('Username is:', username);
    var userEmail = req.params.userEmail;
    console.log('Username is:', userEmail);
    let arr = [];
    generateResetToken(arr);
    const resetToken = arr.join("");
    console.log(resetToken);
    var q = `Select username, email from users where username = '${username}' and email = '${userEmail}'`;
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(q, function (error, results, fields) {
            if (error) {
                res.end(JSON.stringify(response.failure)); 
            };
            var data = results;
            res.send({data: data, token: resetToken});
            console.log(results.length);
        });
        connection.release();

    });
});

const generateResetToken = (arr) => {
    for (i = 0; i < 20; i++) {
        var x = Math.floor(Math.random() * 10);
        arr.push(x)
    }
    // console.log(arr);
}

// router.get('/reset', function(req, res) {
//     res.render('reset', {resetToken})
// })

module.exports = router;