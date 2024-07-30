var express = require('express');
var router = express.Router();
var axios = require('axios');
var QRcode = require('qrcode');


// GET トップ画面：VP要求ボタンを表示
router.get('/', function(req, res, next) {
  res.render('index');
});

