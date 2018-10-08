var express = require('express');
var router = express.Router();


router.get('/admin', function(req, res){
    var viewjs = '../public/js/admin.js';
    var viewcss = '../public/styles/admin.css';
    res.render('admin', {viewjs: viewjs, viewcss: viewcss});
});

module.exports = router;