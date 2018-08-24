"use strict";

const ModelAccount = require("../models/account.model");


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

ControllerAccount.Login = function Login(req, res){
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
    ModelAccount.getAccountDetial(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

ControllerAccount.Fogetpass = function Fogetpass(req, res){
    ModelAccount.getAccountDetial(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

module.exports = ControllerAccount;