var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsDanhGia = require('../Utils/utilsDanhGia');
const share = require('../share');
const permission = require('../middleware/permission');
const utilsHoso = require('../Utils/utilsHoSo');
const utilsLog = require('../utils/utilsLog')
//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req, res, next) => {
    try {
        let rs = await utilsDanhGia.getAllpure();
        rs = await share.decodeArray(rs[0]);
        if (!req.admin)
            rs = rs.filter(r => req.dshosoquanly.includes(r[`idhs`]))
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/list' , async (req,res, next) => {
    try {
        let rs = await utilsDanhGia.getAll();
        rs = await share.decodeArray(rs[0]);
        rs = await share.fillTable(rs);
        if (!req.admin)
            rs = rs.filter(r => req.dshosoquanly.includes(r[`id hồ sơ`]))
        // console.log(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsDanhGia.getById(parseInt(req.params.id));
        rs = await share.decodeArray(rs[0]);
        if (!req.admin)
            if(!req.dshosoquanly.includes(rs[0][`id hồ sơ`])){
                res.sendStatus(403);
                return;
            }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/idHoso/:id' , async (req,res, next) => {
    try {
        if (!req.admin)
            if(!req.dshosoquanly.includes(parseInt(req.params.id))){
                res.sendStatus(403);
                return;
            }
        let rs = await utilsDanhGia.getByIdHS(parseInt(req.params.id));
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        const danhgia = req.body.danhgia; //danhgia.id va danhgia.ten
        var userid =req.userid;
        var hanhdong = req.body.hanhdong;
        // userid = 1;
        // hanhdong = "Cập nhật";
        if (!req.admin)
            if(!req.dshosoquanly.includes(danhgia[`id hồ sơ`])){
                res.sendStatus(403);
                return;
            }
        var dg = new utilsDanhGia(danhgia["id"],danhgia["id hồ sơ"],danhgia["Năm"],danhgia["Đánh giá"],danhgia["Xếp loại"],danhgia["Ghi chú"]);
        var olddanhgia = await utilsDanhGia.getById(danhgia['id']);
        olddanhgia = olddanhgia[0][0];

        var rs = await utilsDanhGia.update(userid, hanhdong, olddanhgia, dg);
        if (rs == -1){
            res.statusCode = 200;
            res.statusMessage = 'NOT Update';
            messenger = "Không có thay đổi dữ liệu";
        }
        else{
            res.statusCode = 200;
            res.statusMessage = 'Create success';
            messenger = "Thêm thành công";
        }
        res.json({"res":messenger});    
    
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const danhgia = req.body.danhgia;
        var userid = req.userid;
        // userid = 1;
        if (!req.admin)
            if(!req.dshosoquanly.includes(danhgia[`id hồ sơ`])){
                res.sendStatus(403);
                return;
            }
        var dg = new utilsDanhGia(null ,danhgia["id hồ sơ"],danhgia["Năm"],danhgia["Đánh giá"],danhgia["Xếp loại"],danhgia["Ghi chú"]);
        var rs = await utilsDanhGia.insert(userid, dg);
        
        res.statusCode = 200;
        res.statusMessage = 'Create success';
        messenger = "Thêm thành công";
        res.json({"res":messenger}); 

    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

// router.post('/multInsert', permission.create, async (req, res, next) => { 
//     try {
//         const danhgias = req.body.danhgia;
//         for (const danhgia of danhgias){
//             var dg = new utilsDanhGia(null, danhgia["id hồ sơ"],danhgia["Năm"],danhgia["Đánh giá"],danhgia["Xếp loại"],danhgia["Ghi chú"]);
//             var rs = await utilsDanhGia.insert(dg);
//         }
//         res.json(rs[0]);
//     } catch (err) {
//         await share.errorMailer(req, res, next, err.stack.toString());
//         console.log(err);
//         res.json(err);
//     }
// });

router.post('/insert/list', permission.create, async (req, res, next) => { 
    try {
        const danhgia = req.body.danhgia;
        const userid = req.userid;
        var list = danhgia[`id hồ sơ`];
        
        if (!req.admin)
        for (const obj of list){
            if(!req.dshosoquanly.includes(obj)){
                res.sendStatus(403);
                return;
            }
        }
        for (const obj of list){
            var dg = new utilsDanhGia(null, obj, danhgia["Năm"],danhgia["Đánh giá"],danhgia["Xếp loại"],danhgia["Ghi chú"]);
            var rs = await utilsDanhGia.insert(userid ,dg);
        }
        res.statusCode = 201;
        res.statusMessage = 'Create success';
        messenger = "Thêm thành công";
        res.json({"res":messenger});
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/delete/:id' , permission.delete, async (req,res, next) => {
    try {
        var ids = req.params.id.split(',');
        var success =[];
        var fail =[];
        for (var id of ids){
            id = parseInt(id);
            if (isNaN(id)){
                res.sendStatus(404)
                return;
            }
            var olddg = await utilsDanhGia.getById(id);
            if (!req.admin && !req.dshosoquanly.includes(olddg[0][0][`id hồ sơ`])){
                fail.push(id)
            }
            else{
                let rs = await utilsDanhGia.delete(id);
                if (rs[0].affectedRows == 1){
                    await utilsLog.deleteAction(req.userid, 'danhgia', id);
                    success.push(id);
                }
                else
                    fail.push(id);
            }
        }
        res.statusCode = 202;
        res.statusMessage = 'Delete success';
        messenger = "Xóa thành công";
        res.json({"res":messenger, "success":success, "fail":fail});
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.statusCode = 400;
        res.json(err);
    }
})

//import
router.post('/import', permission.create , async (req,res, next) => {
    try {
        const danhgia = req.body.danhgia;
        const userid = req.userid;
        var i = 1;
        var fail =[];
        while (danhgia[i] != undefined){
            if (danhgia[i][0] != undefined){
                var idHoso = await utilsHoso.getBySTD(danhgia[i][0]);
                idHoso = idHoso[0][0].id;
                if (!req.admin && !req.dshosoquanly.includes(idHoso)){
                    fail.push(id)
                }
                var dg = new utilsDanhGia(null, idHoso, danhgia[i][2], danhgia[i][3], danhgia[i][4], null );
                await utilsDanhGia.insert(userid, dg);
            }
            i++;
        }
        if (fail.length==0)
            res.json({"res":"Thành công"});
        else{
            res.json({"res":"thêm thất bại", "fail":fail})
        }
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

module.exports = router;