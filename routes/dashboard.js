var express = require('express');
var router = express.Router();

const  { authenticationMiddleware } = require('./middleware');

router.get('/dashboard',authenticationMiddleware(), function(req, res){
    var viewjs = '../public/js/dashboard.js';
    var viewcss = '../public/styles/dashboard.css';
    res.render('dashboard', {viewjs: viewjs, viewcss: viewcss});
});

module.exports = router;