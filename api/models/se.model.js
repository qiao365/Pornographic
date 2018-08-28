"use strict";
const IP2Region = require('ip2region');
const sequelize = require('../domain/se.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");
const DomainGoods = TABLE_DEFINE.DomainGoods;
const DomainUser = TABLE_DEFINE.DomainUser;
const DomainOrderList = TABLE_DEFINE.DomainOrderList;
const Contants = require('../utils/Contants');
const DomainGoodsDetails = TABLE_DEFINE.DomainGoodsDetails;
var ModelSe = module.exports;


ModelSe.getCitys = function getCitys(req,res){
    let city = req.params.city;
    return DomainGoods.findAll({
        attributes:["area"],
        where:{
            city:city
        },
        group:["city"]
    }).then(all=>{
        return all;
    });
}

/**
 * 获取 GOODS LIST
 */
ModelSe.getGoodsList = function getGoodsList(req,res) {
    let curPage = req.params.curPage;
    let limit = req.params.limit;
    return DomainGoods.findAndCount({
        order:[
            ["clicks","DESC"]
        ],
        order:[
            ["visitors","DESC"]
        ],
        limit:limit,
        offset: (curPage - 1) * limit
    }).then(result=>{
        let allGoods = result.rows,
            count = result.count;
        return  {list: allGoods, total: Math.ceil(count/limit), count: count};
    });
};

ModelSe.getGoodsItemDetails = function getGoodsItemDetails(req,res) {
    let id = req.params.id;
    return DomainGoods.findOne({
        where:{
            id:id
        }
    }).then(goods=>{
        return goods.increment({visitors:1}).then(()=>{
            return goods;
        });
    });
};

ModelSe.getGoodsListByCity = function getGoodsListByCity(req,res) {
    let curPage = req.params.curPage;
    let limit = req.params.limit;
    let area = req.params.area;
    return DomainGoods.findAndCount({
        where:{
            area:area
        },
        order:[
            ["clicks","DESC"]
        ],
        order:[
            ["visitors","DESC"]
        ],
        limit:limit,
        offset: (curPage - 1) * limit
    }).then(result=>{
        console.log(JSON.stringify(result));
        let allGoods = result.rows,
            count = result.count;
        return  {list: allGoods, total: Math.ceil(count/limit), count: count};
    });
};

ModelSe.getGoodsItemPrivate = function getGoodsItemPrivate(req,res){
    let id = req.params.id;
    let user = res.locals.oauth.token.user;
    return DomainOrderList.findOne({
        where:{
            goodsId:id,
            userId:user.id
        }
    }).then(order=>{
        if(order){
            return DomainGoodsDetails.findOne({
                where:{
                    id:id
                }
            }).then(details=>{
                return {
                    isSuccess:true,
                    message:details,
                };
            });
        } else  return DomainUser.findOne({
            where:{
                id:user.id
            }
        }).then(account=>{
            return {
                isSuccess:false,
                message:'请购买',
                do3Fei:Contants.do3Fei,
                balance:account.balance
            };
        });
    });
}

ModelSe.getGoodsItemPrivateByBuy = function getGoodsItemPrivateByBuy(req,res){
    let id = req.params.id;
    let user = res.locals.oauth.token.user;
    return DomainOrderList.findOne({
        where:{
            goodsId:id,
            userId:user.id
        }
    }).then(order=>{
        if(order){
            return true;
        } else  return DomainUser.findOne({
            where:{
                id:user.id
            }
        }).then(account=>{
            if(account.balance >= Contants.do3Fei){
                return account.increment({balance:-Contants.do3Fei}).then(()=>{
                    return DomainOrderList.create({
                        goodsId:id,
                        userId:account.id,
                        fei:Contants.do3Fei,
                        status:'ok'
                    }).then(()=>{
                        return true;
                    });
                });
            }else  return false;
        });
    }).then(msg=>{
        if(msg){
            return DomainGoodsDetails.findOne({
                where:{
                    id:id
                }
            }).then(details=>{
                return {
                    isSuccess:true,
                    message:details,
                };
            });
        }else{
            return {
                isSuccess:false,
                message:'余额不足'
            };
        }
    });
}

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