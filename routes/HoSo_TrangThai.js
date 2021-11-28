var express = require('express');
const utils = require('../middleware/utils');
const utilsHoSo_TrangThai = require('../Utils/utilsHoSo_TrangThai');
var router = express.Router();
const share = require('../share');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        var rs = await utilsHoSo_TrangThai.getAll();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        var infoCu = req.body.trangThaiCu;
        var infoMoi = req.body.trangThaiMoi
        var tt = new utilsHoSo_TrangThai(infoCu[`idhs`], infoCu[`idtt`], infoCu[`start`])
        var tt2 = new utilsHoSo_TrangThai(infoMoi[`idhs`], infoMoi[`idtt`], infoMoi[`start`])
        var rs = await utilsHoSo_TrangThai.update(tt2, tt);
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        var info = req.body.info;
        var tt = new utilsHoSo_TrangThai(info[`idhs`], info[`idtt`], info[`start`])
        var rs = await utilsHoSo_TrangThai.insert(tt);
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/delete/:id', permission.delete, async (req, res, next) => { 
    try {
        var rs = await utilsHoSo_TrangThai.delete(req.params.id);
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/:id' , async (req,res, next) => {
    try {
        var rs = await utilsHoSo_TrangThai.getById(req.params.id);
        rs = rs[0];
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

module.exports = router;