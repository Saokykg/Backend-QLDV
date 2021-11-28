var express = require('express');
const utils = require('../middleware/utils');
// const utilsAccount = require('../Utils/utilsAccount');
var router = express.Router();
const utilsLog = require('../Utils/utilsLog');
const share = require('../share');
const utilsChiBo = require('../utils/utilsChiBo');
const permission = require('../middleware/permission');


router.use(permission.read);

router.get('/log/llct/:id', async (req, res, next) => {
    try {
        var rs = await utilsLog.getLog('hoso','Lý luận chính trị',req.params.id);
        rs = share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/log/chucDanh/:id', async (req, res, next) => {
    try {
        var rs = await utilsLog.getLog('hoso','Chức danh',req.params.id);
        rs = share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/log/doiTuong/:id', async (req, res, next) => {
    try {
        var rs = await utilsLog.getLog('hoso','Đối tượng',req.params.id);
        rs = share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/log/sinhHoat/:id', async (req, res, next) => {
    try {
        var rs = await utilsLog.getLog('hoso','Chi bộ',req.params.id);
        rs = share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});



module.exports = router;
