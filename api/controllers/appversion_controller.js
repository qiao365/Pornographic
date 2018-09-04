"use strict";

const rf = require("fs"); 
var AppCheckVersion = module.exports;

//版本
AppCheckVersion.checkversion = function checkversion(req, res) {
    return new Promise((resolve, reject) => {
        var appmsg = JSON.parse(rf.readFileSync("appversion.json","utf-8"));
        resolve(appmsg);
    }).then((appmsg) => {
        res.status(200);
        res.json(appmsg);
    }).catch((error) => {
        res.status(500);
        res.json("error");
    });
};


module.exports.AppCheckVersion = AppCheckVersion;