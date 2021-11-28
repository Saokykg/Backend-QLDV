var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsMien = require('../Utils/utilsMienSinhHoat');
const share = require('../share');
const permission = require('../middleware/permission');
const utilsLog = require('../Utils/utilsLog');
const utilHoSo = require('../utils/utilsHoSo');
const utilsMienSinhHoat = require('../Utils/utilsMienSinhHoat');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsMien.getAll();
        rs = await share.decodeArray(rs[0]);
        if (!req.admin)
            rs = rs.filter(r => req.dshosoquanly.includes(r[`id hồ sơ`]))
        rs = await share.fillTable(rs);
        // console.log(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/List' , async (req,res, next) => {
    try {
        let rs = await utilsMien.getAll();
        rs = await share.decodeArray(rs[0]);
        if (!req.admin)
            rs = rs.filter(r => req.dshosoquanly.includes(r[`id hồ sơ`]))
        rs = await share.fillTable(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsMien.getById(parseInt(req.params.id));
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

router.get('/idHoSo/:id' , async (req,res, next) => {
    try {
        console.log(req.params.id);
        if (!req.admin)
            if(!req.dshosoquanly.includes(parseInt(req.params.id))){
                res.sendStatus(403);
                return;
            }
        let rs = await utilsMien.getByIdHs(parseInt(req.params.id));
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create , async (req,res, next) => {
    try {
        var info = req.body.mien;
        var userid = req.userid;
        // userid = 1;
        if (!req.admin)
        if(!req.dshosoquanly.includes(info[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        }
        var mien = new utilsMien(null, info[`id hồ sơ`], info[`Từ ngày`], info[`Đến ngày`]);
        let rs = await utilsMien.insert(userid, mien);
        
        res.statusCode = 201;
        res.statusMessage = 'Create success';
        messenger = "Thêm thành công";
        res.json({"res":messenger});
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

// router.post('/mulInsert', permission.create , async (req,res, next) => {
//     try {
//         var infos = req.body.mien;
//         for (const info of infos){
//             var mien = new utilsMien(null, info[`id hồ sơ`], info[`Từ ngày`], info[`Đến ngày`]);
//             let rs = await utilsMien.insert(mien);
//         }
//         res.json(rs[0]);
//     } catch (err) {
//         await share.errorMailer(req, res, next, err.stack.toString());
//         console.log(err);
//         res.json(err);
//     }
// })

router.put('/update', permission.edit , async (req,res, next) => {
    try {
        var info = req.body.mien;
        var userid = req.userid;
        var hanhdong = req.body.hanhdong;
        // userid = 1;
        // hanhdong = "capaj nhat";

        if (!req.admin)
        if(!req.dshosoquanly.includes(info[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        }

        var mien = new utilsMien(info.id, info[`id hồ sơ`], info[`Từ ngày`], info[`Đến ngày`]);
        var oldmien = await utilsMien.getById(info.id);
        oldmien = oldmien[0][0];

        let rs = await utilsMien.update(userid, hanhdong, oldmien, mien);
        if (rs != -1) ans = true;

        if (rs){
            res.statusCode = 201;
            res.statusMessage = 'Create success';
            messenger = "Thêm thành công";
        }else{
            res.statusCode = 200;
            res.statusMessage = 'NOT Update';
            messenger = "Không có thay đổi dữ liệu";
        }

        res.json({"res":messenger});
        
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.delete('/delete/:id', permission.delete , async (req,res, next) => {
    try {
        var ids = req.params.id.split(',');
        var success =[];
        var fail =[];
        for (var id of ids){
            id = parseInt(id);
            var oldmien = await utilsMienSinhHoat.getById(id);
            oldmien= oldmien[0][0];
            if (!req.admin)
            if(!req.dshosoquanly.includes(oldmien[`id hồ sơ`])){
                fail.push(id)
            }
            else
           { let rs = await utilsMien.delete(id);
            if (rs[0].affectedRows == 1){
                await utilsLog.deleteAction(req.userid, 'lichsu_miensinhhoat', id);
                success.push(id);
            }
            else
                fail.push(id);}
        }
        res.statusCode = 202;
        res.statusMessage = 'Delete success';
        messenger = "Xóa thành công";
        res.json({"res":messenger, "success":success, "fail":fail});
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

//import
router.post('/import' , permission.create, async (req,res, next) => {
    try {
        const miensh = req.body.miensh;
        const userid = req.userid;
        var i = 1;
        var fail = [];
        while(miensh[i] != undefined){
            if (miensh[i][0] != undefined){
                var idHoso = await utilHoSo.getBySTD(miensh[i][0]);
                idHoso = idHoso[0][0].id;
                if (!req.admin && !req.dshosoquanly.includes(x)){
                    fail.push(id)
                }
                else{
                    var tu = (miensh[i][2] != null) ? miensh[i][2].split('/').join('-') : null;
                    var den = (miensh[i][3] != null) ? miensh[i][3].split('/').join('-') : null;
                    var mien = new utilsMien(null, idHoso, tu, den);
                    await utilsMien.insert(userid, mien);
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