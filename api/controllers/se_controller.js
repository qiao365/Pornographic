"use strict";

const ModelSe = require("../models/se.model");
const redis = require('../domain/se.prepare').redis;

var ControllerSe = module.exports;

/**
 * @param {*} req 
 * @param {*} res 
 */
ControllerSe.getGoodsList = function getGoodsList(req, res){
    ModelSe.getGoodsList(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};


ControllerSe.createGoods = function createGoods(req, res){
    ModelSe.createGoods(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

ControllerSe.getGoodsItem = function getGoodsItem(req, res){
    ModelSe.getGoodsList(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

ControllerSe.getGoodsItemPrivate = function getGoodsItemPrivate(req, res){
    ModelSe.getGoodsList(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};