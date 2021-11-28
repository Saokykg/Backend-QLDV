var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsThongKe = require('../Utils/utilsThongKe');
const share = require('../share');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);

router.get('/chiBo/:dau/:cuoi' , async (req,res, next) => {
    try {
        var dau = req.params.dau;
        var cuoi = req.params.cuoi;
        console.log('chibo', dau, cuoi)
        // console.log(dau, cuoi);
        if (dau == '1-1-1900' || dau == '01-01-1900' || dau == '1-1-1990' || dau == '01-01-1990')
            var rs = await utilsThongKe.getChiBo(cuoi);
        else
            var rs = await utilsThongKe.getChiBoKhoang(dau, cuoi); // fix here
    
        rs = await share.decodeArray(rs[0]);
        // console.log(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})


router.get('/dangVien/:dau/:cuoi', async (req,res, next) => { // bảng tổng hợp
    // console.log("SE");
    try {
        var dau = req.params.dau;
        var cuoi = req.params.cuoi;
        var result =[];
        console.log('dubi chinhthuc', dau, cuoi)

        if (dau == '1-1-1900' || dau == '01-01-1900')
            var chibo = await utilsThongKe.getDSchiBo(cuoi);
        else
            var chibo = await utilsThongKe.getDSchiBo(cuoi);
        chibo = await share.decodeArray(chibo[0]);
        // console.log(chibo);
        for (const id of chibo){
            if (dau == '1-1-1900' || dau == '01-01-1900')
                var rs = await utilsThongKe.getDangVien(cuoi, id.id);
            else
                var rs = await utilsThongKe.getDangVienKhoang(dau, cuoi, id.id);
            rs = await share.decodeArray(rs[0]);
            var tmp = {};
            tmp["name"] = id.t;
            var tmp2 =[];
            if (rs.length == 0){}
            for (const i of rs){
                tmp2.push(i);
            }
            tmp["series"] = tmp2;
            result.push(tmp); 
        }
        res.json(result);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})


router.get('/doiTuong/:dau/:cuoi', async (req,res, next) => { // bảng tổng hợp

    try {
        var dau = req.params.dau;
        var cuoi = req.params.cuoi;
        // console.log(dau, cuoi);
        console.log('doituong', dau, cuoi)
        var result =[];
        if (dau == '1-1-1900' || dau == '01-01-1900')
            var chibo = await utilsThongKe.getDSchiBo(cuoi);
        else
            var chibo = await utilsThongKe.getDSchiBo(cuoi);
        chibo = await share.decodeArray(chibo[0]);
        // console.log(chibo);
        for (const id of chibo){
            if (dau == '1-1-1900' || dau == '01-01-1900')
                var rs = await utilsThongKe.getDoiTuong(cuoi, id.id);
            else
                var rs = await utilsThongKe.getDoiTuongKhoang(dau, cuoi, id.id);
            rs = await share.decodeArray(rs[0]);
            // console.log(rs);
            var tmp = {};
            tmp["name"] = id.t;
            var tmp2 =[];
            if (rs.length == 0){}
            for (const i of rs){
                tmp2.push(i);
            }
            tmp["series"] = tmp2;
            // console.log(tmp);
            result.push(tmp); 
        }
        // console.log(result);
        res.json(result);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})


router.get('/chucDanh/:dau/:cuoi', async (req,res, next) => { // bảng tổng hợp
    try {
        var dau = req.params.dau;
        var cuoi = req.params.cuoi;
        console.log('chucdanh', dau, cuoi)
        // console.log(dau, cuoi);
        var result =[];
        // console.log(req.params);
        if (dau == '1-1-1900' || dau == '01-01-1900')
            var chibo = await utilsThongKe.getDSchiBo(cuoi);
        else
            var chibo = await utilsThongKe.getDSchiBo(cuoi);
        chibo = await share.decodeArray(chibo[0]);
        // console.log(chibo);
        for (const id of chibo){
            if (dau == '1-1-1900' || dau == '01-01-1900')
                var rs = await utilsThongKe.getChucDanh(cuoi, id.id);
            else
                var rs = await utilsThongKe.getChucDanhKhoang(dau, cuoi, id.id);
            rs = await share.decodeArray(rs[0]);
            // rs = rs[0]
            // console.log(rs[0].name);
            var tmp = {};
            tmp["name"] = id.t;
            var tmp2 =[];
            if (rs.length == 0){}
            for (const i of rs){
                tmp2.push(i);
            }
            // console.log(tmp2);
            tmp["series"] = tmp2;
            // console.log(tmp);
            result.push(tmp); 
        }
        res.json(result);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})



router.get('/llct/:dau/:cuoi', async (req,res, next) => { // bảng tổng hợp
    try {
        var dau = req.params.dau;
        var cuoi = req.params.cuoi;
        var result =[];
        if (dau == '1-1-1900' || dau == '01-01-1900')
            var chibo = await utilsThongKe.getDSchiBo(cuoi);
        else
            var chibo = await utilsThongKe.getDSchiBo(dau, cuoi);
        chibo = await share.decodeArray(chibo[0]);
        // console.log(chibo);
        for (const id of chibo){
            if (dau == '1-1-1900' || dau == '01-01-1900')
                var rs = await utilsThongKe.getLLCT(cuoi, id.id);
            else
                var rs = await utilsThongKe.getLLCTKhoang(dau, cuoi, id.id);
            rs = await share.decodeArray(rs[0]);
            var tmp = {};
            tmp["name"] = id.t;
            var tmp2 =[];
            if (rs.length == 0){}
            for (const i of rs){
                tmp2.push(i);
            }
            tmp["series"] = tmp2;
            result.push(tmp); 
        }
        res.json(result);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/:sad/:asd', async (req,res, next) => {
    console.log(req.params)
    res.json("NO PAGE");
})

router.get('/:sad/:asd/:d', async (req,res, next) => {
    console.log(req.params)
    res.json("NO PAGE");
})

router.get('/slChiBo/:ngay' , async (req,res, next) => {
    try {
        var ngay = req.params.ngay;
        var rs = await utilsThongKe.countChiBo(ngay);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/chiBo/:id/:ngay' , async (req,res, next) => {
    try {
        var ngay = req.params.ngay;
        var id = req.params.id;
        var rs = await utilsThongKe.getChiBo_DangVien(id, ngay);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})


router.get('/dangVienDuBi/:ngay', async (req,res, next) => { // danh sách Đảng viên dự bị
    try {
        var ngay = req.params.ngay;
        var loai = 'Dự bị';
        var rs = await utilsThongKe.getLoaiDangVien(ngay, loai);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/dangVienChinhThuc/:ngay', async (req,res, next) => { // danh sách đảng viên chính thức
    try {
        var ngay = req.params.ngay;
        var loai = 'Chính thức';
        var rs = await utilsThongKe.getLoaiDangVien(ngay, loai);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})


router.get('/doiTuong/:loai/:ngay', async (req,res, next) => { // bảng tổng hợp
    try {
        var ngay = req.params.ngay;
        var loai = req.params.loai
        var rs = await utilsThongKe.getLoaiDoiTuong(ngay, loai);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})


router.get('/llct/:loai/:ngay', async (req,res, next) => { // bảng tổng hợp
    try {
        var ngay = req.params.ngay;
        var loai = req.params.loai
        var rs = await utilsThongKe.getLoaiLLCT(ngay, loai);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/chucDanh/:loai/:ngay', async (req,res, next) => { // bảng tổng hợp
    try {
        var ngay = req.params.ngay;
        var loai = req.params.loai
        var rs = await utilsThongKe.getLoaiChucDanh(ngay, loai);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})



module.exports = router;