var express = require('express');
var router = express.Router();

const  { authenticationMiddleware } = require('./middleware');

router.get('/graph',authenticationMiddleware(), function(req, res) {
    var viewjs = '../public/js/graph.js';
    var viewcss = '../public/styles/graph.css';
    res.render('graph', {viewjs: viewjs, viewcss: viewcss});
});

module.exports = router;