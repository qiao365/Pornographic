"use strict";

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const moment = require('moment');
const IP2Region = require('ip2region');
const sequelize = require('../domain/se.prepare').sequelize;
const TABLE_DEFINE = require("../domain/table.define");

function mkdirs(dirname, callback) {  
    fs.exists(dirname, function (exists) {  
        if (exists) {  
            callback();  
        } else {  
            mkdirs(path.dirname(dirname), function () {  
                fs.mkdir(dirname, callback);  
            });  
        }  
    });  
}  
var ModelFile = module.exports;

ModelFile.uploadFile = function uploadFile(req,res){
    // 添加配置文件到muler对象。
    const upload = multer({
        storage: multer.diskStorage({
            //设置上传后文件路径，upload文件夹会自动创建。
            destination: function (req, file, cb) {
                const dirfull = path.join(__dirname,'../../upload');
                cb(null, dirfull);
            }, 
            //给上传文件重命名，获取添加后缀名
            filename: function (req, file, cb) {
                const dirname = path.join( moment().format('YYYYMMDD'));
                const dirfull = path.join(__dirname,'../../upload',dirname);
                const extname = path.extname(file.originalname);
                let newFileName = moment().format('HHmmssSSS') + extname;
                const relativeFileName = path.join(dirname,newFileName);
                mkdirs(dirfull,function () {
                    cb(null, relativeFileName);
                });
            }
        })
    });
    upload.single('file');
    const {originalname,filename} = req.file;
    res.status(200);
    res.json({
        success: true,
        data:{
            oriFileName:originalname,
            filePath:filename,
        }
    });
};

module.exports = ModelFile;