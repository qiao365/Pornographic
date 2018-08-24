const TABLE_DEFINE = require("../domain/table.define");
const utils = require("../util/utils");
const Web3 = require("web3");
const moment = require("moment");
const rpc = require('../domain/se.prepare').CONFIG.rpcApi;
var rpcWeb3 = new Web3(new Web3.providers.HttpProvider(rpc));
const sequelize = require("../domain/se.prepare").sequelize;
const Contants = require('../util/Contants');
var ModelEthListener = module.exports;

ModelEthListener.startTokenListener = function startTokenListener(){
    let abi = utils.abi;
    var MyContract = rpcWeb3.eth.contract(abi);
    var myContractInstance = MyContract.at("0x5f3789907b35DCe5605b00C0bE0a7eCDBFa8A841");
    console.log("<<<<<<<<<<<<"+"CAN"+":startListener"+">>>>>>>>>>>>>>");
    var someone = myContractInstance.Transfer();
    someone.watch(function(error, transactiondate){
        console.log("-------------ModelEthListener");
        if(!error){
            console.log("---Transfer---"+"CAN"+"------");
            return isContains(transactiondate.args._from, transactiondate.args._to).then(isRelative=>{
                if(isRelative){
                    console.log(">>>>>>>>发现一个交易>>token>>>>>>"+JSON.stringify(transactiondate.transactionHash)+"\n");
                    sequelize.transaction((trans) => {
                        let decimal = 1e18;
                        let receipt = rpcWeb3.eth.getTransactionReceipt(transactiondate.transactionHash);
                        var tokenValue = 0;
                        var tokenFrom = "";
                        var tokenTo = "";
                        tokenValue = transactiondate.args._value/decimal + "";//转换为标准数字 string 如：“1000000000000000000”——》"1"
                        tokenFrom = transactiondate.args._from.toLowerCase();
                        tokenTo = transactiondate.args._to.toLowerCase();
                        
                        let det = {
                            tokenContractAddress:transactiondate.address,
                            bankType: 'CAN',
                            transactionStatus:receipt.status,
                            transactionHash: transactiondate.transactionHash,
                            transactionBlockHash: transactiondate.blockHash,
                            transactionBlockNumber: transactiondate.blockNumber, 
                            transactionFrom: tokenFrom.toLowerCase(),
                            transactionTo: tokenTo.toLowerCase(),
                            transactionValue: tokenValue
                        };
                            return TABLE_DEFINE.DomainTingWangTransaction.findOne({
                                where:{
                                    transactionTo:tokenTo,
                                    transactionFrom:tokenFrom,
                                    needValue: tokenValue,
                                    status:'wait'
                                }
                            }).then(dtt=>{
                                if(dtt){
                                    return TABLE_DEFINE.DomainTingWangTransaction.update({
                                            status:'ok',
                                            transactionValue:tokenValue,
                                            transactionHash: transactiondate.transactionHash,
                                            transactionBlockHash: transactiondate.blockHash,
                                            transactionBlockNumber: transactiondate.blockNumber, 
                                            transactionDate: new Date()}
                                        ,{
                                            where:{
                                                transactionTo:tokenTo,
                                                transactionFrom:tokenFrom,
                                                needValue: tokenValue,
                                                status:'wait'
                                            }
                                        });
                                }
                            });
                    });
                }
            });
        }else{
            console.error(error);
        }
    });
};
//是否在数据库
function isContains(_from,_to){
    return new Promise((resolve, reject)=>{
        if(_to !== Contants.receiveAddress){
            resolve(false);
        }else{
            return TABLE_DEFINE.DomainTingWangTransaction.findOne({
                where:{
                    transactionFrom:_from,
                    transactionTo:_to,
                    status:'wait'
                }
            }).then(radd=>{
                if(radd == null || radd == undefined){
                    resolve(false);
                }
                resolve(true);
            });
        }
    });
};