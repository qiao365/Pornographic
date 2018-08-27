const Sequelize = require('./se.prepare').Sequelize;
const sequelize = require('./se.prepare').sequelize;
const redis = require('./se.prepare').redis;
const moment = require('moment');
const KEYS = require("../models/oauth2.model").KEYS;
const ModelEthListener = require("../models/eth.listener");

const createdAt = {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: "created_at",
    get() {
        return getDate.call(this, 'createdAt');
    }
}

const updatedAt = {
    type: Sequelize.DATE,
    field: "updated_at",
    get() {
        return getDate.call(this, 'updatedAt');
    }
}

function getDate(field, tz) {
    tz = tz === undefined ? 8 : tz;
    let value = this.getDataValue(field);
    if(value == null) {
        return '';
    }
    return moment(this.getDataValue(field)).utcOffset(tz).format('YYYY-MM-DD HH:mm:ss');
}

var model = module.exports;

model.DomainUser = sequelize.define("t_do_user", {
    account: {
        type: Sequelize.STRING,
        unique: true
    },
    accountName: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    phone: {
        type: Sequelize.STRING,
        unique: true
    },
    areacode: {
        type: Sequelize.STRING,
        defaultValue:'86'
    },
    password:{
        type: Sequelize.STRING
    },
    balance: {
        type: Sequelize.INTEGER,
        field: "balance",
        defaultValue:0
    },
    addressId:{
        type: Sequelize.INTEGER,
        field: "addressid",
        unique: true
    },
    tip:{
        type: Sequelize.STRING,
        field: "tip"
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainDoAddress = sequelize.define("t_do_address", {
    address: {
        type: Sequelize.STRING,
        field: "address",
        unique: true
    },
    used: {
        type: Sequelize.BOOLEAN,
        field: "used",
        defaultValue:false
    },
    account: {
        type: Sequelize.STRING,
        unique: true
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainDoAddress.hasOne(model.DomainUser, {as: 'user', foreignKey: 'addressid'});
model.DomainUser.belongsTo(model.DomainDoAddress, {as: 'address', foreignKey: 'addressid'});

//goods list
model.DomainGoods = sequelize.define("t_do_goods", {
    name: {
        type: Sequelize.STRING,
        field: "name"
    },
    age:{
        type: Sequelize.INTEGER,
        field: "age"
    },
    country:{
        type: Sequelize.STRING,
        field: "country"
    },
    city:{
        type: Sequelize.STRING,
        field: "city"
    },
    area:{
        type: Sequelize.STRING,
        field: "area"
    },
    brief:{
        type: Sequelize.STRING,
        field: "brief"
    },
    visitors:{
        type: Sequelize.INTEGER,
        field: "visitors",
        defaultValue:1
    },
    clicks:{
        type: Sequelize.INTEGER,
        field: "clicks",
        defaultValue:0
    },
    price:{
        type: Sequelize.STRING,
        field: "price"
    },
    serviceTime:{
        type: Sequelize.DATE,
        field: "servicetime"
    },
    service:{
        type: Sequelize.STRING,
        field: "service"
    },
    describe:{
        type: Sequelize.STRING(1024),
        field: "describe"
    },
    pictures:{
        type: Sequelize.ARRAY(Sequelize.STRING),
        field: "pictures"
    },
    creator:{
        type: Sequelize.STRING,
        field: "creator"
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainGoodsDetails = sequelize.define("t_do_goods_details", {
    goodsId:{
        type: Sequelize.INTEGER,
        field: "goodsid",
        allowNull: false,
        unique: true
    },
    tel: {
        type: Sequelize.STRING,
        field: "tel"
    },
    qq: {
        type: Sequelize.STRING,
        field: "qq"
    },
    wechat: {
        type: Sequelize.STRING,
        field: "wechat"
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainGoods.hasOne(model.DomainGoodsDetails, {as: 'goodsDetails', foreignKey: 'goodsid'});

//Order list
model.DomainOrderList = sequelize.define("t_order_list", {
    goodsId:{
        type: Sequelize.INTEGER,
        field: "goodsid",
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: Sequelize.STRING,
        field: "userid",
        allowNull: false,
        primaryKey: true
    },
    fei: {
        type: Sequelize.DOUBLE,
        field: "fei"
    },
    status:{//wait-cancel-ok
        type: Sequelize.STRING,
        field: "status",
        defaultValue:"wait"
    },
    createdAt: createdAt,
    updatedAt: updatedAt
});

model.DomainGoods.hasMany(model.DomainOrderList, {as: 'goodsOrder', foreignKey: 'goodsid'});
model.DomainUser.hasMany(model.DomainOrderList, {as: 'userOrder', foreignKey: 'userid'});

model.DomainEthTransaction = sequelize.define("t_eth_transaction", {
    address:{
        type: Sequelize.STRING,
        field: "address"
    },
    bankType:{
        type: Sequelize.STRING,
        field: "bank_type"
    },
    txHash:{
        type: Sequelize.STRING,
        field: "tx_hash"
    },
    blockHash:{
        type: Sequelize.STRING,
        field: "block_hash"
    },
    blockNumer:{
        type: Sequelize.INTEGER,
        field: "block_numer"
    },
    txFrom:{
        type: Sequelize.STRING,
        field: "tx_from"
    },
    txTo:{
        type: Sequelize.STRING,
        field: "tx_to"
    },
    txValue:{
        type: Sequelize.DECIMAL(40,8),
        field: "tx_value"
    },
})

sequelize.sync({ force: false }).then(() => {
    let user = {
        account:'xoadmin',
        email:'xoadmin@xoadmin.com',
        phone:'10000086',
        password:'xoadmin@xoadmin.com'
    };
    return model.DomainUser.findOne().then(userfind=>{
        if(!userfind){
            return model.DomainUser.create(user).then(createUser=>{
                let key = `${KEYS.user}${createUser.account}`;
                user.id = createUser.id;
                return redis.hmsetAsync(key, user);
            });
        }
        return user;
    }).then(()=>{
        ModelEthListener.startFilter(model);
        console.log(`------------ app start ------------`);
    });
});
