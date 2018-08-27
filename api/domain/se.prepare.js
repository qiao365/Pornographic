const Sequelize = require('sequelize');
const bluebird = require('bluebird');
const redisdb = require('redis');
const APP = "qingyise";
const KEYS = require("../models/oauth2.model").KEYS;
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

var redis = redisdb.createClient();
bluebird.promisifyAll(redisdb.RedisClient.prototype);
bluebird.promisifyAll(redisdb.Multi.prototype);
redis.hmset(`${KEYS.client}${APP}`, {
    clientId: APP,
    clientSecret: 'gX1fBat3bV'
});
const CONFIG = {
    rpcApi:'http://localhost:8545'
};

exports.sequelize = sequelize;
exports.Sequelize = Sequelize;
exports.redis = redis;
exports.CONFIG = CONFIG;
