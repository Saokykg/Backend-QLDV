var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsHoSo_QuyHoach = require('../Utils/utilsHoSo_QuyHoach');
const utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const share = require('../share');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsHoSo_QuyHoach.getAllpure(req.params.id);
        rs = await share.decodeArray(rs[0]);
        // console.log(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/idHoSo/:id' , async (req,res, next) => {
    try {
        let rs = await utilsHoSo_QuyHoach.getByidHS(req.params.id);
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/list' , async (req,res, next) => {
    try {
        let rs = await utilsHoSo_QuyHoach.getAll();
        rs = await share.decodeArray(rs[0]);
        rs = await fill(rs);
        console.log(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/list/:id' , async (req,res, next) => {
    try {
        let rs = await utilsHoSo_QuyHoach.getAllinOne(req.params.id);
        rs = await share.decodeArray(rs[0]);
        rs = await fill(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/listFull/:id' , async (req,res, next) => {
    try {
        let rs = await utilsHoSo_QuyHoach.getFulllist(req.params.id);
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
        var info = req.body.quyhoach;
        var quyhoach = new utilsHoSo_QuyHoach(info[`id hồ sơ`], info[`id quy hoạch`], info[`Cấp quy hoạch`], info[`Chức vụ`]);
        var rs = await utilsHoSo_QuyHoach.update(quyhoach);

        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        var info = req.body.quyhoach;
        var quyhoach = new utilsHoSo_QuyHoach(info[`id hồ sơ`], info[`id quy hoạch`], info[`Cấp quy hoạch`], info[`Chức vụ`]);
        var rs = await utilsHoSo_QuyHoach.insert(quyhoach);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/delete/:idqh/:idhs', permission.delete, async (req, res, next) => { 
    try {
        var rs = await utilsHoSo_QuyHoach.delete(req.params.idhs, req.params.idqh);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});


module.exports = router;


async function fill(rs){
    for(const hs of rs){
        var tmp = [
            {"Dự bị" : hs.db},
            {"Chính thức" : hs.ct}
        ];
        hs[`Ngày vào đảng`] = tmp;
    }
    return rs;
}