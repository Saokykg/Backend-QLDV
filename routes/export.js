var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
const xlsx = require("xlsx");
var utilsHoSo = require('../Utils/utilsHoSo');
var utilschucvu = require('../Utils/utilsChucVu');
const share = require('../share');
const permission = require('../middleware/permission');
// var utilsHuyHieu = require('../Utils/utilsHuyHieu');



//middleware for checking access token
router.use(permission.read);

router.post('/' , async (req,res, next) => {
    
    //create new excel file


    //add data
    // Modify the xlsx      
    try {
        var ans;
        try {
            var rs = req.body.table;
            const newBook = xlsx.utils.book_new();
            const newSheet = xlsx.utils.json_to_sheet(rs);
            xlsx.utils.book_append_sheet(newBook, newSheet, "Sheet1");
            var d = new Date();
            var path ="../../Documents/excel/"+ d.getDate() +"-"+ d.getHours() + "-" + d.getMinutes() +"-"+ d.getSeconds() +".xlsx";
            xlsx.writeFile(newBook, path);
            ans = {"res":"Xuất file thành công, thư mục Document/excel"};
        } catch (error) {
            ans = {"res":"Xuất file thất bại"};
            console.log(error);
        }
        res.json(ans);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

module.exports = router;



