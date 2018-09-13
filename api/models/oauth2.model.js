var model = module.exports;
var bluebird = require('bluebird');
var redisdb = require('redis');
var db = redisdb.createClient();
bluebird.promisifyAll(redisdb.RedisClient.prototype);
bluebird.promisifyAll(redisdb.Multi.prototype);

const TIME_LIMIT = 7 * 24 * 60 * 60;
const KEYS = {
    token: "token:",
    client: "clients:",
    refreshToken: "refresh_token:",
    grantTypes: ":grant_types",
    user: "userse:"
};

model.getAccessToken = function(bearerToken) {
    return db.getAsync(`${KEYS.token}${bearerToken}`).then((account) => {
        if (!account) {
            return undefined;
        };
        return db.hgetallAsync(`${KEYS.token}${account}`).then((token) => {
            if (!token) {
                return undefined;
            };
            if(bearerToken !== token.accessToken){
                return  db.delAsync(`${KEYS.token}${bearerToken}`).then(()=>{
                    return undefined;
                });
            }
            return {
                accessToken: token.accessToken,
                accessTokenExpiresAt: new Date(token.accessTokenExpiresAt),
                client: JSON.parse(token.client),
                refreshToken: token.refreshToken,
                refreshTokenExpiresAt: new Date(token.refreshTokenExpiresAt),
                user: JSON.parse(token.user)
            };
        });
    }).catch(err=>{
        return undefined;
    });
};

model.getClient = function(clientId, clientSecret) {
    let key = `${KEYS.client}${clientId}`;
    console.log('key',key);
    return db.hgetallAsync(key).then((client) => {
        if (!client || client.clientSecret !== clientSecret) return undefined;
        return {
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            grants: ["password", "refresh_token"]
        };
    });
};

model.getRefreshToken = function(bearerToken) {
    console.log("getRefreshToken");
    return db.hgetallAsync(`${KEYS.refreshToken}${bearerToken}`).then((token) => {
        if (!token) return undefined;
        console.log(token);
        return db.hgetallAsync(`${KEYS.token}${JSON.parse(token.user).id}`).then((authToken) => {
            // console.log(authToken.refreshToken , bearerToken);
            if(authToken.refreshToken !== bearerToken){
                return  db.delAsync(`${KEYS.refreshToken}${bearerToken}`).catch(err=>{
                    console.log(err);
                }).then(()=>{
                    return undefined;
                });
            }else{
                return {
                    accessToken: token.accessToken,
                    accessTokenExpiresAt: new Date(token.accessTokenExpiresAt),
                    client: JSON.parse(token.client),
                    refreshToken: token.refreshToken,
                    refreshTokenExpiresAt: new Date(token.refreshTokenExpiresAt),
                    user: JSON.parse(token.user)
                };
            }
        });
    }).catch(err=>{
        return undefined;
    });
};

model.revokeToken = function(token){
    db.delAsync(`${KEYS.token}${token.accessToken}`);
    return db.delAsync(`${KEYS.refreshToken}${token.refreshToken}`).then((refreshed)=>{
        return !!refreshed;
    });
};


model.getUser = function(username, password) {
    let key = `${KEYS.user}${username}`;
    return db.hgetallAsync(key).then((user) => {
        if (!user || password !== user.password) {
            return undefined;
        }
        // console.log('getUser:'+JSON.stringify(user));
        return {
            id: user.id,
            account: user.account
        };
    });
};

/**
 * Save token.
 */

model.saveToken = function(token, client, user) {
    var data = {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        client: JSON.stringify(client),
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        user: JSON.stringify(user)
    };
    console.log(user);
    return Promise.all([
        db.hmsetAsync(`${KEYS.token}${user.id}`, data),
        db.setAsync(`${KEYS.token}${token.accessToken}`, user.id),
        db.hmsetAsync(`${KEYS.refreshToken}${token.refreshToken}`, data)
    ]).then(() => {
        db.expire(`${KEYS.token}${user.id}`, TIME_LIMIT);
        db.expire(`${KEYS.token}${token.accessToken}`, TIME_LIMIT);
        db.expire(`${KEYS.refreshToken}${token.refreshToken}`, TIME_LIMIT*1.5);
        return data;
    }).catch(err=>{
        console.log(err);
    });
};

model.KEYS = KEYS;
