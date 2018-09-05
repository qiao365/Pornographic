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
    let city = req.body.city;
    return DomainGoods.findAll({
        attributes:["area"],
        where:{
            city:{$like:`%${city}%`}
        },
        group:["area"]
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
    let area = req.body.area;
    return DomainGoods.findAndCount({
        where:{
            area:{$like:`%${area}%`}
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
    return DomainGoods.findOne({
        where:{
            id:id
        }
    }).then(goods=>{
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
                    return [true,{
                        isSuccess:true,
                        message:"已支付",
                        qq:details.qq,
                        wechat:details.wechat,
                        tel:details.tel,
                        do3Fei:goods.seePrice
                    }];
                });
            } else  return [false,{
                isSuccess:false,
                message:'请购买',
                do3Fei:goods.seePrice
            }];
        });
    }).then(([bool,data])=>{
        return DomainUser.findOne({
            where:{
                id:user.id
            }
        }).then(account=>{
            data.balance = account.balance;
            return data;
        });
    });
}

ModelSe.getGoodsItemPrivateByBuy = function getGoodsItemPrivateByBuy(req,res){
    let id = req.params.id;
    let user = res.locals.oauth.token.user;
    return DomainGoods.findOne({
        where:{
            id:id
        }
    }).then(goods=>{
        let dobi = goods.seePrice;
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
                if(account.balance >= dobi){
                    return account.increment({balance:-dobi}).then(()=>{
                        return DomainOrderList.create({
                            goodsId:id,
                            userId:account.id,
                            fei:dobi,
                            status:'ok'
                        }).then(()=>{
                            return DomainUser.findOne({
                                where:{
                                    account:goods.creator
                                }
                            }).then(user=>{
                                return user.increment({balance:Math.ceil(dobi*Contants.do3Reward)}).then(()=>{
                                    return true;
                                });
                            });
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
                        message:"已支付",
                        qq:details.qq,
                        wechat:details.wechat,
                        tel:details.tel
                    };
                });
            }else{
                return {
                    isSuccess:false,
                    message:'余额不足'
                };
            }
        });
    });
}

ModelSe.createGoods = function createGoods(req,res) {
    let account = res.locals.oauth.token.user.account;
    let body = req.body;
    body.creator = account;
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