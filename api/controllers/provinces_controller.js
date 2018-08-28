"use strict";
const utils = require('../utils/utils');
var ControllerProvinces = module.exports;

ControllerProvinces.getProvinces = function getProvinces(req, res){
    let provinces = utils.getProvinces();
    res.status(200);
    res.json(provinces);
};

module.exports = ControllerProvinces;