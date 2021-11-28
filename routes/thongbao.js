var express = require('express');
const utils = require('../middleware/utils');
const utilsHoSo = require('../utils/utilsHoSo');
var router = express.Router();
var utilsThongBao = require('../Utils/utilsThongBao');
const share = require('../share');
const permission = require('../middleware/permission');



//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsThongBao.getNow();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})
router.put('/read', async (req, res, next) => {
    try {
        var id = req.body.id;
        var rs = await utilsThongBao.readed(id);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})
router.get('/list' , async (req,res, next) => {
    try {
        let rs = await utilsThongBao.getAll();
        rs = await share.decodeArray(rs[0]);
        // console.log(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})
router.get('/threeMonth' , async (req,res, next) => {
    try {
        let rs = await utilsThongBao.get3month();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

module.exports = router;