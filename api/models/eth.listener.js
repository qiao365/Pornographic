const Web3 = require("web3");
const rpc = require('../domain/se.prepare').CONFIG.rpcApi;
const rpcWeb3 = new Web3(new Web3.providers.HttpProvider(rpc));
const Contants = require('../utils/Contants');
const BigNumber = require('bignumber.js');
const Decimal = require('decimal');
var ModelEthListener = module.exports;

let model;
ModelEthListener.startFilter = function startFilter(modell) {
    model = modell;
    var filter = rpcWeb3.eth.filter("latest");
    console.log('-------------eth filter-----------');
    filter.watch((err, blockhash)=>{
        if(!err){
            return genereateWatchHandle(blockhash);
        };
    });
};
//分析监听到的 块 信息
function genereateWatchHandle(blockHash){
        return new Promise((resolve, reject)=>{
            //获取这个 块 的信息
            rpcWeb3.eth.getBlock(blockHash, (err, lastBlock)=>{
                if(!err){
                    resolve(lastBlock);
                };
            });
        }).then((theBlock)=>{
            //根据这个块的 信息 获取交易hash数组
            return bulkGetTransaction(theBlock);
        }).then((txArray)=>{
            //txArray 是 返回的交易信息
            let filteredArray = txArray.filter((ele)=> ele);//过滤 undefined                            
            console.log("all:"+txArray.length+", filtered:"+filteredArray.length);
            var list = [];
            if(filteredArray.length >0 ){
                filteredArray.forEach((ele)=>{
                    if(ele.value == 0 ){
                        return;
                    }
                    console.log('---',Decimal(ele.value).toNumber(),'-----');
                    let data =  {
                        address: ele.to,
                        bankType: 'ETH',
                        txHash: ele.hash,
                        blockHash: ele.blockHash,
                        blockNumer: ele.blockNumber,
                        txFrom: ele.from,
                        txTo: ele.to,
                        txValue: Decimal(ele.value).toNumber()
                    };
                    if(ele.value > 0 ){//  =0时候不知是做什么，当然或者token代币转币
                        list.push(data);
                    }
                });
                return model.DomainEthTransaction.bulkCreate(list).then(()=>{
                    let all = list.map(item=>{
                        return model.DomainUser.findOne({
                            include:
                                {
                                    model: model.DomainDoAddress,
                                    as: 'address',
                                    where: {
                                        address:item.address
                                    }
                                }
                        }).then(user=>{
                            if(!user) return;
                            return user.increment({balance:Contants.ethToDo*item.txValue/1e18}).then(()=>{
                                console.log('----------',user.account,item.txValue/1e18,Contants.ethToDo*item.txValue/1e18,'------------');
                                return {
                                    user:user.account,
                                    eth:item.txValue/1e18,
                                    do:Contants.ethToDo*item.txValue/1e18
                                };
                            });
                        });
                    });
                    return Promise.all(all).then(back=>{
                        console.log('接受eth：',back.length,list.length);
                    });
                });
            }
        });
    
};

 //根据这个块的 信息 获取交易hash数组
let bulkGetTransaction = function(theBlock){
    return new Promise((resolve, reject)=>{
        if(theBlock.transactions == null || theBlock.transactions == undefined){
            resolve([]);
        }
        let txSize = theBlock.transactions.length;
        let txArray = [];
        function bulkFixNumberTrans(start, step){
            let transactionsArray = theBlock.transactions.slice(start, start+step);
            //获取数据库关联的 交易的数据
            let transactionArraydate = transactionsArray.map((transaction)=>{
                return new Promise((resolve, reject)=>{
                    rpcWeb3.eth.getTransaction(transaction, (err, transactiondate)=>{
                        if(!err && transactiondate != null){
                            return isContains(transactiondate.to).then(isRelative=>{
                                if(isRelative){
                                    // console.log(">>>>>>>>"+JSON.stringify(transactiondate)+">>>>>>>>");
                                }
                                resolve(isRelative ? transactiondate : undefined);
                            });
                        }else {
                            resolve(undefined);
                        };
                    });
                });
            });
            return Promise.all(transactionArraydate).then((txarray)=>{
                txArray.push.apply(txArray, txarray);
                if(start + step >= txSize){
                    return txArray;
                }else{
                    return bulkFixNumberTrans(start+step, step);
                }
            });
        };
        bulkFixNumberTrans(0, 1).then((txarray)=>{
            resolve(txarray);
        });
    });
};

//是否在数据库
function isContains(_to){
    return model.DomainDoAddress.findOne({
        where:{
            address:_to
        }
    }).then(radd=>{
        if(!radd){
            return false;
        }
        return true;
    });
}