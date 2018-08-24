var Sequelize = require('sequelize');

const APP = "sesese";
var sequelize = new Sequelize(APP, APP, `${APP}`, {
    host: "localhost",
    logging: false,
    define: {
        freezeTableName: true,
        underscored: true
    },
    pool: {
        max: 50,
        min: 0,
        acquire: 30000,
        idle: 2000
    }, 
    dialect: 'postgres',
    timezone: '+08:00' //东八时区
});

var bluebird = require('bluebird');
var redisdb = require('redis');
var redis = redisdb.createClient();
bluebird.promisifyAll(redisdb.RedisClient.prototype);
bluebird.promisifyAll(redisdb.Multi.prototype);
/**
//如果时区不正确，则需要放开
require('pg').types.setTypeParser(1114, stringValue => {
    return new Date(stringValue + "+0000");
    // e.g., UTC offset. Use any offset that you would like.
});
 **/
/**
初始化数据
**/

const CONFIG = {
    rpcApi:'http://localhost:8545'
};

exports.sequelize = sequelize;
exports.Sequelize = Sequelize;
exports.redis = redis;
exports.CONFIG = CONFIG;
