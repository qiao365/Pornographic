"use strict";
const IP2Region = require('ip2region');
const sequelize = require('../domain/se.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainGoods = TABLE_DEFINE.DomainGoods;
const DomainGoodsDetails = TABLE_DEFINE.DomainGoodsDetails;
var ModelSe = module.exports;

/**
 * 获取 GOODS LIST
 */
ModelSe.getGoodsList = function getGoodsList(req,res) {
    return DomainGoods.findAll().then(allbox=>{
        
    });
};