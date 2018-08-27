"use strict";

const sequelize = require('../domain/se.prepare').sequelize;
const Table = require('../domain/table.define');
const DomainUser = Table.DomainUser;
const redis = require('../domain/se.prepare').redis;
const DomainDoAddress = Table.DomainDoAddress;
const svgCaptcha = require('svg-captcha');
const KEYS = require('../models/oauth2.model').KEYS;
var ModelAccount = module.exports;

ModelAccount.getAccountDetial = function getAccountDetial(req,res){
   let user = res.locals.oauth.token.user;
    return DomainUser.findOne({
        where:{
            id:user.id
        }
    }).then(account=>{
        if(account.addressId){
            return DomainDoAddress.findOne({
                where:{
                    id:account.addressId,
                    account:account.account
                }
            }).then(address=>{
                return {
                    isSuccess:true,
                    message:address.address,
                    code:10000
                };
            });
        }
        return sequelize.transaction((trans) => {
            return DomainDoAddress.findOne({
                where:{
                    used:false
                },
                order:[
                    ['id', 'ASC']
                ]
            }).then(address=>{
                if(!address){
                    return {
                        isSuccess:false,
                        message:"地址池不足，请联系管理员",
                        code:10001
                    };
                }
                return address.update({
                        used:true,
                        account:account.account
                },{transaction: trans}).then(update=>{
                    return account.update({
                            addressId:address.id
                    },{transaction: trans}).then(updateAcc=>{
                        return {
                            isSuccess:true,
                            message:address.address,
                            code:10000
                        };
                    });
                });
            });
        });
    });
};

ModelAccount.Fogetpass = function Fogetpass(req,res){
    let body = req.body;
    return DomainUser.findOne({
        where:{
            account:body.account
        }
    }).then(account=>{
        return {
            isSuccess:true,
            message:account.tip ? account.tip : 'no',
            code:1001
        };
    });
};

ModelAccount.Register = function Register(req,res){
   let body = req.body;
   let captcha = req.session && req.session.captcha;
   if(!captcha || body.captcha != captcha){
        return Promise.resolve({
            isSuccess:false,
            message:"验证码错误",
            code:1003
        });
   }
   if(!body.account || !body.password || body.password.length < 6){
       return Promise.resolve({
            isSuccess:false,
            message:"密码格式错误",
            code:1000
       });
   }
    return DomainUser.findOne({
        where:{
            account:body.account
        }
    }).then(findOne=>{
        if(!findOne){
            let user = {
                account:body.account,
                password:body.password,
                tip:body.tip
            };
            return DomainUser.create(body).then(createUser=>{
                let key = `${KEYS.user}${createUser.account}`;
                user.id = createUser.id;
                return redis.hmsetAsync(key, user).then(redis=>{
                    return {
                        isSuccess:true,
                        message:"注册成功",
                        code:1001
                    };
                });
            });
        }else  return {
            isSuccess:false,
            message:"已被注册",
            code:1002
        };
    });
};

ModelAccount.getCaptcha = function getCaptcha(req,res){
    let opt = {
        size:3,
        ignoreChars: '0o1i', // 验证码字符中排除 0o1i
        noise: 2, // 干扰线条的数量
        color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
        background: '#ffffff' // 验证码图片背景颜色
    };
    var captcha = svgCaptcha.createMathExpr(opt);   
    console.log(captcha.text);
    req.session.captcha = captcha.text;
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data); 
}

ModelAccount.verify = function verify(req,res,next){
    let body = req.body;
    let captcha = req.session && req.session.captcha;
   if(!captcha || body.captcha != captcha){
    res.status(200).send({
        isSuccess:false,
        message:"验证码错误",
        code:1003
    });
   }else next();
}

module.exports = ModelAccount;