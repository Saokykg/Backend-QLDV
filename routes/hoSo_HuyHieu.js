var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsHoSoHuyHieu = require('../Utils/utilsHoso_HuyHieu');
const utilsHuyHieu = require('../Utils/utilsHuyHieu');
const utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const share = require('../share');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    let rs = await utilsHoSoHuyHieu.getAllpure();
    rs = await share.decodeArray(rs[0]);
    res.json(rs);
})

router.get('/listHighest' , async (req,res, next) => {
    try {
        let rs = await utilsHoSoHuyHieu.getMax();
        rs = await share.decodeArray(rs[0]);
        // console.log(rs);
        rs = await share.fillTable(rs);
        for (const hs of rs){
            var nam = hs[`Tuổi Đảng`];
            while(true){
                var kt =false;
                if ((nam >=50 && nam % 5 == 0) || (nam >= 30 && nam%10 == 0) || nam > 90){
                    var tmp = await utilsHoSoHuyHieu.getByIdNam(hs[`id`], nam);
                    tmp = tmp[0];
                    if (tmp.length == 0)
                        kt = true;
                }
                if (kt){
                    break;
                }
                nam++;
            }
            var ans = await utilsHoSoHuyHieu.getCountDown(hs[`id`],nam);
            // console.log(ans[0]);
            ans = await share.decodeArray(ans[0]);
            ans = ans[0];
            hs[`Đếm ngược ngày nhận`] = ans[`năm`];
            if (hs[`Đếm ngược ngày nhận`]  < 0) hs[`Đếm ngược ngày nhận`] = hs[`Đếm ngược ngày nhận`] +365*10;
            var ans2 = await utilsHuyHieu.countHH(hs[`id`]);
            if (ans2[0].length === 0) ans2 = 0;
            else
                ans2 = ans2[0][0].c
            hs[`Tổng số huy hiệu`] = ans2;
        }
        if (!req.admin)
            rs = rs.filter(r => req.dshosoquanly.includes(r[`id`]))
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/list' , async (req,res, next) => {
    try {
        let rs = await utilsHoSoHuyHieu.getAll();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:idhs/:idhh' , async (req,res, next) => {
    try {
        let rs = await utilsHoSoHuyHieu.getByIdHsHh(req.params.idhs, req.params.idhh);
        rs = await share.decodeArray(rs[0]);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/idhosoList/:id' , async (req,res, next) => {
    try {
        let rs = await utilsHoSoHuyHieu.getByIdHs(req.params.id);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/idhoso/:id' , async (req,res, next) => {
    try {
        let rs = await utilsHoSoHuyHieu.getByIdHsPure(req.params.id);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/idhuyhieu/:id' , async (req,res, next) => {
    try {
        let rs = await utilsHoSoHuyHieu.getByIdHh(req.params.id);
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
        var ans = false;
        var userid= req.userid;
        var hanhdong = req.body.hanhdong;
        const huyhieu = req.body.huyhieunew; //huyhieu
        
        for (const hh of huyhieu){
            var idsqd = null;
            if (hh[`id số quyết định`]){
                console.log(hh);
                var s = new utilsSoQuyetDinh(hh[`id số quyết định`], hh[`Số quyết định`], hh[`Ngày ban hành`], null);
                var oldsqd = await utilsSoQuyetDinh.getById(hh[`id số quyết định`]);
                oldsqd = oldsqd[0][0];
                var rssql = await utilsSoQuyetDinh.update(userid, hanhdong, oldsqd, s);
                if (rssql != -1) ans = true;
                idsqd = hh[`id số quyết định`];
                
                var h = new utilsHoSoHuyHieu(hh[`id hồ sơ`], hh[`id huy hiệu`], hh[`Ngày cấp`], idsqd);
                var oldhuyhieu = await utilsHoSoHuyHieu.getByid(hh[`id số quyết định`]);
                oldhuyhieu = oldhuyhieu[0][0];
                
                var rs = await utilsHoSoHuyHieu.update(userid, hanhdong, oldhuyhieu, h);
                if (rs != -1) ans = true;
            }
            else{
                var s = new utilsSoQuyetDinh(null, hh[`Số quyết định`], hh[`Ngày ban hành`], "Huy hiệu");
                var rssql = await utilsSoQuyetDinh.insert(userid, s);
                idsqd = rssql[0][0].result;
                var h = new utilsHoSoHuyHieu(hh[`id hồ sơ`], hh[`id huy hiệu`], hh[`Ngày cấp`], idsqd); 
                
                var rs = await utilsHoSoHuyHieu.insert(userid, hh['Ngày ban hành'], h);
                if (rs != -1) ans = true;
            }

            
        }

        if (ans){
            res.statusCode = 201;
            res.statusMessage = 'Update success';
            messenger = "Chỉnh sửa thành công";
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

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        var huyhieu = req.body.huyhieu;
        var userid = req.userid;
        huyhieu = huyhieu[0];
        var idsqd = null;
        if (huyhieu['Số quyết định'] != null && huyhieu['Số quyết định'] != undefined){
            // console.log(huyhieu);
            var s = new utilsSoQuyetDinh(null, huyhieu[`Số quyết định`], huyhieu[`Ngày ban hành`], "Huy hiệu");
            var rssql = await utilsSoQuyetDinh.insert(userid, s);
            idsqd = rssql[0][0].result;
        }
    
        var hh = new utilsHoSoHuyHieu(huyhieu[`id hồ sơ`], huyhieu[`id huy hiệu`], huyhieu[`Ngày cấp`], idsqd);
        var rs = await utilsHoSoHuyHieu.insert(userid, huyhieu['Ngày ban hành'], hh);
        // console.log(rs);
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

router.delete('/delete/:idhs/:idhh', permission.delete, async (req, res, next) => { 
    try {
        var rs = await utilsHoSoHuyHieu.delete(req.params.idhs, req.params.idhh);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});


module.exports = router;