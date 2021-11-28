var express = require('express');
const utils = require('../middleware/utils');
const utilsChiBo = require('../utils/utilsChiBo');
const utilsHoSo = require('../utils/utilsHoSo');
const utilsHoSo_ChucVu = require('../utils/utilsHoSo_ChucVu');
const utilsHoSo_QuyHoach = require('../Utils/utilsHoSo_QuyHoach');
var router = express.Router();
var utilsQuyHoach = require('../Utils/utilsQuyHoach');
var utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const share = require('../share');
const permission = require('../middleware/permission');



//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsQuyHoach.getAll();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsQuyHoach.getById(parseInt(req.params.id));
        rs = await share.decodeArray(rs[0]);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create , async (req,res, next) => {
    try {
        var quyhoach = req.body.quyhoach;
        var danhsach = req.body.danhsach;
        var userid = req.userid;

        
        var sqd = new utilsSoQuyetDinh(null, quyhoach[`Số quyết định`], quyhoach[`Ngày ban hành`], 'Quy hoạch');
        var rssqd = await utilsSoQuyetDinh.insert(userid, sqd);
        rssqd = rssqd[0][0].result;

        var qh = new utilsQuyHoach(null, quyhoach[`Nội dung`], quyhoach[`Ngày`], rssqd, quyhoach['Cấp quy hoạch'], quyhoach['Nhiệm kỳ']);
        var rsqh = await utilsQuyHoach.insert(userid, quyhoach[`Ngày ban hành`], qh);

        for (const ds of danhsach){
            var hs = new utilsHoSo_QuyHoach(null, ds[`id hồ sơ`], rssqd,  ds[`Chức vụ`], ds[`Đơn vị`]);
            var rs = await utilsHoSo_QuyHoach.insert(userid, quyhoach[`Ngày ban hành`], hs);

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
})

router.put('/update', permission.edit , async (req,res, next) => {
    try {
        const quyhoach = req.body.quyhoach;
        var danhsach = req.body.danhsach;
        var userid = req.userid;
        var hanhdong = req.body.hanhdong;
        var ans = false;

        var sqd = new utilsSoQuyetDinh(quyhoach[`id số quyết định`],quyhoach[`Số quyết định`], quyhoach[`Ngày ban hành`], null);
        var oldsqd = await utilsSoQuyetDinh.getById(quyhoach[`id số quyết định`]);
        oldsqd = oldsqd[0][0];

        var rssqd = await utilsSoQuyetDinh.update(userid, hanhdong, oldsqd , sqd);
        if (rssqd != -1) ans = true;

        var qh = new utilsQuyHoach(quyhoach[`id`],quyhoach[`Nội dung`], quyhoach[`Ngày`], quyhoach[`id số quyết định`], 
                                quyhoach['Cấp quy hoạch'], quyhoach['Nhiệm kỳ']);
        var oldqh = await utilsQuyHoach.getById(quyhoach[`id`]);
        oldqh = oldqh[0][0];

        let rsqh = await utilsQuyHoach.update(userid, hanhdong, oldqh, qh);
        if (rsqh != -1) ans = true;

        var list=[];
        for (const ds of danhsach){
            if (ds[`id`]){
                list.push(ds[`id`]);
                var hs = new utilsHoSo_QuyHoach(ds[`id`], ds[`id hồ sơ`], quyhoach[`id`],  ds[`Chức vụ`], ds[`Đơn vị`]);
                var oldhs = await utilsHoSo_QuyHoach.getById(ds[`id`]);
                oldhs = oldhs[0][0];
                var rs = await utilsHoSo_QuyHoach.update(userid, hanhdong, oldhs, hs);
                if (rs != -1) ans = true;
            }else{
                var hs = new utilsHoSo_QuyHoach(null, ds[`id hồ sơ`], quyhoach[`id`],  ds[`Chức vụ`], ds[`Đơn vị`]);
                var rs = await utilsHoSo_QuyHoach.insert(userid, quyhoach[`Ngày ban hành`], hs);
                list.push(rs[0][0].result);
                ans = true;
            }
        }

        if (ans){
            await utilsHoSo_QuyHoach.deleteOL(list);
            res.statusCode = 200;
            res.statusMessage = 'Update success';
            messenger = "Cập nhật thành công";
        }
        else{
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

router.delete('/delete/:id', permission.delete, async (req,res, next) => {
    try {
        var ids = req.params.id
        var array_id = [];
        var success =[];
        var fail =[];
        await ids.split(',').forEach(id => array_id.push(parseInt(id)));
        for (const id of array_id){
            var dequyhoach = await utilsHoSo_QuyHoach.delete(id);
            if (dequyhoach[0].affectedRows != 0){
                var rs = await utilsQuyHoach.delete(id);
                if (rs[0].affectedRows != 0)
                    success.push(id);
                else
                    fail.push(id);
            }
        }
        res.statusCode = 202;
        res.statusMessage = 'Create success';
        messenger = "Xóa thành công";
        res.json({"res":messenger});
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        res.statusCode = 400;
        console.log(err);
        res.json(err);
    }
});

//import
router.post('/import', permission.create, async (req, res, next) => {
    try {
        var quyhoach = req.body.thanhtich;
        const userid = req.userid;
        var nd = quyhoach[0][1];
        var sqd = quyhoach[1][1];
        var ngay = quyhoach[2][1];
        var cap = quyhoach[3][1];
        var nhiemky = quyhoach[4][1];
        ngay = ngay.split('/').join('-');
        var quyetdinh = new utilsSoQuyetDinh(null,sqd, ngay, 'quy hoạch');
        var resqd = await utilsSoQuyetDinh.insert(userid, quyetdinh);
        resqd = resqd[0][0].result;
    
        var qh = new utilsQuyHoach(null, nd, ngay, resqd, cap, nhiemky);
        var resqh = await utilsQuyHoach.insert(userid, ngay, qh);
        resqh = resqh[0][0].result;
        console.log(resqh);

        var i = 7;  
        while (quyhoach[i]!= undefined){
            if (quyhoach[i][0] != undefined){
                var hs = await utilsHoSo.getBySTD(quyhoach[i][1]);
                hs = hs[0][0];
                var chibo = await utilsChiBo.getByName(quyhoach[i][5]);
                chibo = chibo[0][0].id
                var hsqh = new utilsHoSo_QuyHoach(null, hs.id, resqh, quyhoach[i][4], chibo);
                await utilsHoSo_QuyHoach.insert(userid, ngay ,hsqh);
            }
            i++;
        }
        res.json({"res": "Thành công"});
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

module.exports = router;