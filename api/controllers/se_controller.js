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

ControllerSe.getGoodsListByCity = function getGoodsListByCity(req, res){
    ModelSe.getGoodsListByCity(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

ControllerSe.getGoodsItemDetails = function getGoodsItemDetails(req, res){
    ModelSe.getGoodsItemDetails(req, res).then((data)=>{
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

ControllerSe.getGoodsItemPrivate = function getGoodsItemPrivate(req, res){
    ModelSe.getGoodsItemPrivate(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};


ControllerSe.getGoodsItemPrivateByBuy = function getGoodsItemPrivateByBuy(req, res){
    ModelSe.getGoodsItemPrivateByBuy(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};

ControllerSe.getCitys = function getCitys(req, res){
    ModelSe.getCitys(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};
