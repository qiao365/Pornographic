const fs = require('fs');
const path = require('path');
let utils = module.exports;

utils.getProvinces = function getProvinces(){
    let provincesJson = fs.readFileSync(path.join(__dirname,'china.json'), 'utf-8');
    return JSON.parse(provincesJson);
}