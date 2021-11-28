var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsThanhTich = require('../Utils/utilsThanhTich');
const utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const share = require('../share');
const permission = require('../middleware/permission');
const utilHoSo = require('../utils/utilsHoSo');
const utilsLog = require('../utils/utilsLog');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsThanhTich.getAllpure();
        rs = await share.decodeArray(rs[0]);
        if (!req.admin)
            rs = rs.filter(r => req.dshosoquanly.includes(r[`id hồ sơ`]))
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/list' , async (req,res, next) => {
    try {
        let rs = await utilsThanhTich.getAll();
        rs = await share.decodeArray(rs[0]);
        rs = await share.fillTable(rs);
        if (!req.admin)
            rs = rs.filter(r => req.dshosoquanly.includes(r[`id hồ sơ`]))
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsThanhTich.getById(parseInt(req.params.id));
        rs = await share.decodeArray(rs[0]);
        if (!req.admin)
        if (!req.dshosoquanly.includes(rs[0][`id hồ sơ`])){
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

router.get('/idHoSo/:id' , async (req,res, next) => {
    try {
        if (!req.admin)
        if (!req.dshosoquanly.includes(parseInt(req.params.id))){
            res.sendStatus(403);
            return;
        } 
        let rs = await utilsThanhTich.getByIdHS(parseInt(req.params.id));
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
        const thanhtich = req.body.thanhtich; 
        var hanhdong = req.body.hanhdong;
        var userid = req.userid;
        ans = false;
        if (!req.admin)
        if (!req.dshosoquanly.includes(thanhtich[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        } 
        var tt = new utilsThanhTich(thanhtich[`id`], thanhtich[`id hồ sơ`], thanhtich[`id số quyết định`], thanhtich[`Ngày khen thưởng`], 
            thanhtich[`Cấp`], thanhtich[`Tên thành tích`], thanhtich[`Khen thưởng`],thanhtich[`Loại khen thưởng`]);
        var oldtt = await utilsThanhTich.getById(thanhtich[`id`]);
        oldtt = oldtt[0][0];
        var rs = await utilsThanhTich.update(userid, hanhdong, oldtt, tt);
        
        if (rs != -1) ans = true;

        var s = new utilsSoQuyetDinh(thanhtich[`id số quyết định`], thanhtich[`Số quyết định`], thanhtich[`Ngày ban hành`], null);
        var oldsqd = await utilsSoQuyetDinh.getById(thanhtich[`id số quyết định`]);
        oldsqd = oldsqd[0][0];

        var rssql = await utilsSoQuyetDinh.update(userid, hanhdong, oldsqd, s);
        if (rssql != -1) ans = true;
        if (ans){
            res.statusCode = 200;
            res.statusMessage = 'Update success';
            messenger = "Cập nhật thành công";
        }
        else{
            res.statusCode = 200;
            res.statusMessage = 'NOT Update';
            messenger = "Không có thay đổi dữ liệu";
        }
        console.log(messenger);
        res.json({"res":messenger});    

    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const thanhtich = req.body.thanhtich;
        const userid = req.userid;
        var idsqd = null;
        if (!req.admin)
        if (!req.dshosoquanly.includes(thanhtich[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        } 
        if (thanhtich['Số quyết định'] != null && thanhtich['Số quyết định'] != undefined){
            var s = new utilsSoQuyetDinh(null, thanhtich[`Số quyết định`], thanhtich[`Ngày ban hành`], "Thành tích");
            var rssql = await utilsSoQuyetDinh.insert(userid, s);
            idsqd = rssql[0][0].result;
        }
        
        var tt = new utilsThanhTich(null, thanhtich[`id hồ sơ`], idsqd, thanhtich[`Ngày khen thưởng`], thanhtich[`Cấp`], 
            thanhtich[`Tên thành tích`], thanhtich[`Khen thưởng`],thanhtich[`Loại khen thưởng`]);
        var rs = await utilsThanhTich.insert(userid, thanhtich[`Ngày ban hành`], tt);

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

// router.post('/mulInsert', permission.create, async (req, res, next) => { // ko xu dung
//     try {
//         const thanhtichs = req.body.thanhtich;
//         var userid = req.userid;
//         for (const thanhtich of thanhtichs){
//             var idsqd = null;

//             if (thanhtich['Số quyết định'] != null && thanhtich['Số quyết định'] != undefined){
//                 var s = new utilsSoQuyetDinh(null, thanhtich[`Số quyết định`], thanhtich[`Ngày ban hành`], "Thành tích");
//                 var rssql = await utilsSoQuyetDinh.insert(userid, s);
//                 idsqd = rssql[0][0].result;
    
//             }
    
//             var tt = new utilsThanhTich(null, thanhtich[`id hồ sơ`], idsqd, thanhtich[`Ngày khen thưởng`], thanhtich[`Cấp`], 
//                 thanhtich[`Tên thành tích`], thanhtich[`Khen thưởng`],thanhtich[`Loại khen thưởng`]);
//             var rs = await utilsThanhTich.insert(userid, thanhtich[`Ngày ban hành`], tt);

            
//             res.statusCode = 201;
//             res.statusMessage = 'Create success';
//             messenger = "Thêm thành công";
//             res.json({"res":messenger});

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
        const thanhtich = req.body.thanhtich;
        var userid = req.userid;
        var idsqd = null;
        var list = thanhtich[`id hồ sơ`];
        if (!req.admin)
        for (const obj of list){
            if (!req.dshosoquanly.includes(obj)){
                res.sendStatus(403);
                return;
            }
        }

        if (thanhtich['Số quyết định'] != null && thanhtich['Số quyết định'] != undefined){
            var s = new utilsSoQuyetDinh(null, thanhtich[`Số quyết định`], thanhtich[`Ngày ban hành`], "Thành tích");
            var rssql = await utilsSoQuyetDinh.insert(userid, s);
            idsqd = rssql[0][0].result;

        }
        // console.log(list);
        for (const obj of list){
            var tt = new utilsThanhTich(null, obj, idsqd, thanhtich[`Ngày khen thưởng`], thanhtich[`Cấp`], 
                thanhtich[`Tên thành tích`], thanhtich[`Khen thưởng`],thanhtich[`Loại khen thưởng`]);
            var rs = await utilsThanhTich.insert(userid, thanhtich[`Ngày ban hành`], tt);
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
            var idhs = await utilsThanhTich.getById(id);
            if (!req.admin && !req.dshosoquanly.includes(idhs[0][0][`id hồ sơ`])){
                fail.push(id)
            }
            else{
                let rs = await utilsThanhTich.delete(id);
                if (rs[0].affectedRows == 1){
                    success.push(id);
                    await utilsLog.deleteAction(req.userid, 'thanhtich', id);
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
        res.statusCode = 400;
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.delete('/deleteByIdHS/:id', permission.delete, async (req, res, next) =>{ // delete from db
    try {
        
        if (!req.admin && !req.dshosoquanly.includes(parseInt(req.params.id))){
            res.sendStatus(403);
            return;
        }
        let rs = await utilsThanhTich.deleteByIdHS(parseInt(req.params.id));
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})



//import
router.post('/import' , permission.create, async (req,res, next) => {
    try {
        const thanhtich = req.body.thanhtich;
        const userid = req.userid;
        var soquyetdinh = thanhtich[1][1];
        var noidung = thanhtich[2][1];
        var ngay = thanhtich[3][1];
        ngay = ngay.split("/").join("-");
        var cap = thanhtich[4][1];
        // console.log(soquyetdinh, noidung, ngay, cap)
        var i = 8;
        var fail = [];
        while (thanhtich[i] != undefined){
            // console.log(thanhtich[i]);
            if (thanhtich[i][0] != undefined){
                var x = await utilHoSo.getBySTD(thanhtich[i][2]);
                x = x[0][0].id;
                if (!req.admin && !req.dshosoquanly.includes(x)){
                    fail.push(id)
                }
                var s = new utilsSoQuyetDinh(null, soquyetdinh, ngay, "Thành tích");
                // console.log(s);
                try{
                    var rssql = await utilsSoQuyetDinh.insert(userid, s);
                }
                catch (error){
                    console.log(error);
                }
                rssql = rssql[0][0].result;
                var tt = new utilsThanhTich(null, x, rssql, ngay, cap, noidung, thanhtich[i][4], thanhtich[i][3]);
                // console.log(tt);
                try {
                    var rs = await utilsThanhTich.insert(userid, ngay, tt);
                } catch (error) {
                    console.log(error);
                }
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