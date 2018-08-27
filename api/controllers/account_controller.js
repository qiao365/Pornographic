"use strict";

const ModelAccount = require("../models/account.model");

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


module.exports = ControllerAccount;