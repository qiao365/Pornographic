"use strict";

const sequelize = require('../domain/se.prepare').sequelize;
const Table = require('../domain/table.define');
const DomainUser = Table.DomainUser;
const redis = require('../domain/se.prepare').redis;
const DomainDoAddress = Table.DomainDoAddress;
const DomainGoods = Table.DomainGoods;
const DomainOrderList = Table.DomainOrderList;
const DomainDoLike = Table.DomainDoLike;
const captcha = require('trek-captcha')
const KEYS = require('../models/oauth2.model').KEYS;
const Contants = require('../utils/Contants');
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
                    address:address.address,
                    balance:account.balance,
                    account:account.account,
                    minEth:Contants.minEth,
                    ethToDo:Contants.ethToDo
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
                        address:'',
                        balance:account.balance,
                        account:account.account,
                        minEth:Contants.minEth,
                        ethToDo:Contants.ethToDo
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
                            address:address.address,
                            balance:account.balance,
                            account:account.account,
                            minEth:Contants.minEth,
                            ethToDo:Contants.ethToDo
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
    getCaptchaF(req,res);
}

async function getCaptchaF(req,res) {
    const { token, buffer } = await captcha({ size: 4, style: -1 })
    console.log( token, buffer);
    req.session.captcha = token;
    res.writeHead(200, {
        'Content-Type': 'image/jpg'
    });
	res.end(buffer); 
}

ModelAccount.verify = function verify(req,res,next){
    let body = req.body;
    let captcha = req.session && req.session.captcha;
    console.log(body.captcha,captcha);
   if(!captcha || body.captcha != captcha){
    res.status(200).send({
        isSuccess:false,
        message:"验证码错误",
        code:1003
    });
   }else next();
}

ModelAccount.getHistory = function getHistory(req,res){
    let user = res.locals.oauth.token.user;
    let curPage = req.params.curPage;
    let limit = req.params.limit;

    return DomainUser.findOne({
        where:{
            account:user.account
        }
    }).then(account=>{
        return DomainGoods.findAndCount({
            include: [
				{
					model: DomainOrderList,
					as: 'goodsOrder',
					where: {
						userId:user.id
                    }
                }
            ],
            limit:limit,
            offset: (curPage - 1) * limit
        }).then(result=>{
            let allGoods = result.rows,
                count = result.count;
            return  {list: allGoods, total: Math.ceil(count/limit), count: count};
        });
    });
};
ModelAccount.iflike = function iflike(req, res){
    let user = res.locals.oauth.token.user;
    let goodsId = req.params.goodsId;
    return DomainDoLike.findOne({
        where:{
            goodsId:goodsId,
            account:user.account,
            like:true
        }
    }).then(likedata=>{
        if(likedata){
            return {isSuccess:true}
        } return {isSuccess:false}
    });
}

//like
ModelAccount.like = function like(req, res){
    let user = res.locals.oauth.token.user;
    let like = req.params.like;
    let goodsId = req.params.goodsId;
    return sequelize.transaction((trans) => {
        if(like == true){
            return DomainDoLike.create({
                goodsId:goodsId,
                account:user.account,
                like:true
            },trans).then(data=>{
                return DomainGoods.findOne({
                    where:{
                        id:goodsId
                    }
                }).then(goods=>{
                    return goods.increment({visitors:1},trans).then(inc=>{
                        return {
                            isSuccess:true
                        }
                    });
                });
            });
        }else{
            return DomainDoLike.destroy({
                where:{
                    goodsId:goodsId,
                    account:user.account
                }
            },trans).then(des=>{
                return {
                    isSuccess:true
                }
            });
        }
    }).catch(err=>{
        return {
            isSuccess:false
        }
    });
}

module.exports = ModelAccount;