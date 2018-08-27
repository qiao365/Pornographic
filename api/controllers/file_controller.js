"use strict";

const ModelFile = require("../models/file.model");

var ControllerFile = module.exports;

/**
 * @param {*} req 
 * @param {*} res 
 */
ControllerFile.uploadFile = function uploadFile(app){
    ModelFile.upload(app);
};