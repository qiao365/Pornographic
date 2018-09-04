"use strict";

const ModelAccount = require("../models/account.model");
const redis = require('../domain/se.prepare').redis;
var ControllerAccount = module.exports;

ControllerAccount.getAccountDetial = function getAccountDetial(req, res){
    ModelAccount.getAccountDetial(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

ControllerAccount.Register = function Register(req, res){
    ModelAccount.Register(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

ControllerAccount.getHistory = function getHistory(req, res){
    ModelAccount.getHistory(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

ControllerAccount.Fogetpass = function Fogetpass(req, res){
    ModelAccount.Fogetpass(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

ControllerAccount.getCaptcha = function getCaptcha(req, res){
    ModelAccount.getCaptcha(req, res);
};

ControllerAccount.verify = function verify(req, res, next){
    ModelAccount.verify(req, res, next);
};

//退出
ControllerAccount.logOut = function logOut(req, res){
    let token = res.locals.oauth.token;
    return redis.delAsync(`${KEYS.token}${token.accessToken}`).then((logOutData)=>{
        redis.delAsync(`${KEYS.refreshToken}${token.refreshToken}`);
        if(logOutData){
            res.status(200);
            res.json({
                isSuccess:true,
                reason:"退出成功"
            });
        }else{
            res.status(500);
            res.json({
                isSuccess:false,
                reason:"退出出现异常"
            });
        }
    }).catch((error) => {
        res.status(500);
        res.json({
            isSuccess:false,
            reason:"退出出现异常"
        });
    });
}

module.exports = ControllerAccount;