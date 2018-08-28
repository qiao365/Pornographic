"use strict";
const moment = require("moment");
const express = require("express"),
    oauthserver = require("express-oauth-server"),
    bodyParser = require("body-parser"),
    path = require('path');
const ControllerFile = require("./api/controllers/file_controller");
const ControllerSe = require("./api/controllers/se_controller");
const ControllerAccount = require("./api/controllers/account_controller");
const ControllerProvinces = require("./api/controllers/provinces_controller");
const tokenValidTime = {accessTokenLifetime: 7 * 24 * 60 * 60,refreshTokenLifetime: 7 * 24 * 60 * 60 * 1.5};
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const prepare = require('./api/domain/se.prepare');
var app = express();
app.use(bodyParser.json({limit:'100mb'}));
app.use(bodyParser.urlencoded({limit:'100mb',extended:true}));
app.enable('trust proxy');//防止ip代理
app.use(session({
    store: new RedisStore({
        client: prepare.redis
    }),
    secret: ["dwwy&^%#v", "S@#^k*(&ewyv"],
    resave: false,
    cookie: {
        maxAge: 7 * 86400 * 1000
    }
}));

app.use(function(req, res, next){
  let method = req.method,
      url = req.originalUrl,
      ip = req.ip;
      console.log(`\n\nStarted ${method} ${url} for ${ip} at ${ moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}`);
      next();
});
//静态目录
app.use("/se/upload",express.static(path.join(__dirname,"./upload")));

app.oauth = new oauthserver({
    model: require('./api/models/oauth2.model')
});

// account
app.post('/se/account/login', ControllerAccount.verify, app.oauth.token(tokenValidTime));
app.post('/se/account/refresh', app.oauth.token(tokenValidTime));//token refresh
app.post('/se/account/register', ControllerAccount.Register);
app.post('/se/account/fogetpass', ControllerAccount.Fogetpass);
app.get('/se/account/dobi/detailed', app.oauth.authenticate(), ControllerAccount.getAccountDetial);
app.get('/se/account/recaptcha/captcha.svg', ControllerAccount.getCaptcha);

app.get('/se/area/provinces', ControllerProvinces.getProvinces);//citys

//-- se
app.get('/se/get/citys/by/province/:province', ControllerSe.getCitys);
app.get('/se/goods/list/:curPage/:limit', ControllerSe.getGoodsList);
app.get('/se/goods/list/by/city/:city/:curPage/:limit', ControllerSe.getGoodsListByCity);
ControllerFile.uploadFile(app);//上传图片
app.post('/se/goods/create', app.oauth.authenticate(), ControllerSe.createGoods);
app.get('/se/goods/list/item/private/:id', app.oauth.authenticate(), ControllerSe.getGoodsItemPrivate);
app.get('/se/goods/list/item/private/bybuy/:id', app.oauth.authenticate(), ControllerSe.getGoodsItemPrivateByBuy);


//-- authed end

var port = process.env.PORT || 8100;
app.listen(port);
// require('./api/controllers/twDistribution');
console.log(`listen the port: ${port}`);

module.exports = app;
