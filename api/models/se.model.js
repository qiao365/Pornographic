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

ModelSe.createGoods = function createGoods(req,res) {
    let body = req.body;
    return sequelize.transaction((trans) => {
        return DomainGoods.create(body,{
            transaction: trans
        }).then(goods=>{
            console.log(JSON.stringify(goods));
            return DomainGoodsDetails.create({
                goodsId:goods.id,
                tel:body.tel,
                qq:body.qq,
                wechat:body.wechat
            },{
                transaction: trans
            }).then(goodsDetails=>{
                return {
                    isSuccess:true,
                    message:'上传成功'
                };
            });
        });
    }).catch(error=>{
        console.error(error);
        return Promise.resolve({
            isSuccess:false,
            message:'创建失败'
        })
    });
};