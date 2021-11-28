var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const share = require('../share');
const permission = require('../middleware/permission');



//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsSoQuyetDinh.getAll();
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
        let rs = await utilsSoQuyetDinh.getById(req.params.id);
        rs = await share.decodeArray(rs[0]);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        const soquyetdinh = req.body.soquyetdinh;
        var sqd = new utilsSoQuyetDinh(soquyetdinh[`id`], soquyetdinh[`Số quyết định`], soquyetdinh[`Ngày ban hành`], null);
        var rs = await utilsSoQuyetDinh.update(sqd); 
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    
    try {
        const sqd = req.body.sqd;
        var s = new utilsSoQuyetDinh(null, sqd[`Số quyết định`], sqd[`Ngày ban hành`], soquyetdinh['Nội dung']);
        var rssql = await utilsSoQuyetDinh.insert(s);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/deleteByid/:id', permission.delete , async (req,res, next) => {
    try {
        let rs = await utilsSoQuyetDinh.delete(req.params.id);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})


module.exports = router;