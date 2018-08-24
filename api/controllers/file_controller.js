"use strict";

const ModelFile = require("../models/file.model");

var ControllerFile = module.exports;

/**
 * @param {*} req 
 * @param {*} res 
 */
ControllerFile.uploadFile = function uploadFile(req, res){
    ModelFile.uploadFile(req, res).then((data)=>{
        res.status(200);
        res.json(data);
    }).catch((error) => {
        console.error(error);
        res.status(500);
        res.json("error");
    });
};