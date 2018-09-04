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
const AppCheckVersion = require("./api/controllers/appversion_controller");
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
app.use("/qingyi/upload",express.static(path.join(__dirname,"./upload")));

app.oauth = new oauthserver({
    model: require('./api/models/oauth2.model')
});

// account
app.post('/qingyi/account/login', ControllerAccount.verify, app.oauth.token(tokenValidTime));
app.post('/qingyi/account/refresh', app.oauth.token(tokenValidTime));//token refresh
app.post('/qingyi/account/register', ControllerAccount.Register);
app.post('/qingyi/account/fogetpass', ControllerAccount.Fogetpass);
app.get('/qingyi/account/dobi/detailed', app.oauth.authenticate(), ControllerAccount.getAccountDetial);//账户信息
app.get('/qingyi/account/recaptcha/captcha.jpg', ControllerAccount.getCaptcha);

app.get('/qingyi/area/provinces', ControllerProvinces.getProvinces);//citys

//-- se
app.get('/qingyi/account/loginout', app.oauth.token(tokenValidTime), ControllerAccount.logOut);
app.post('/qingyi/get/citys/by/city', ControllerSe.getCitys);
app.post('/qingyi/goods/list/:curPage/:limit', ControllerSe.getGoodsList);
app.post('/qingyi/goods/list/by/area/:curPage/:limit', ControllerSe.getGoodsListByCity);
app.get('/qingyi/goods/list/item/details/:id', ControllerSe.getGoodsItemDetails);
ControllerFile.uploadFile(app);//上传图片
app.post('/qingyi/goods/create', app.oauth.authenticate(), ControllerSe.createGoods);
app.get('/qingyi/goods/list/item/private/:id', app.oauth.authenticate(), ControllerSe.getGoodsItemPrivate);
app.get('/qingyi/goods/list/item/private/bybuy/:id', app.oauth.authenticate(), ControllerSe.getGoodsItemPrivateByBuy);
app.get('/qingyi/goods/history/:curPage/:limit', app.oauth.authenticate(), ControllerAccount.getHistory);
app.get('/qingyi/app/appcheck/version', AppCheckVersion.checkversion);//app  version
//-- authed end

var port = process.env.PORT || 8100;
app.listen(port);
// require('./api/controllers/twDistribution');
console.log(`listen the port: ${port}`);

module.exports = app;
