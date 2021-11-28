var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsHuyHieu = require('../Utils/utilsHuyHieu');
const share = require('../share');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsHuyHieu.getAll();
        rs = await share.decodeArray(rs[0]);
        // console.log(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsHuyHieu.getById(parseInt(req.params.id));
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
        const huyhieu = req.body.huyhieu; //huyhieu
        var rs = await utilsHuyHieu.update(huyhieu[`id`], huyhieu[`Tên`]);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const ten = req.body.ten;
        var rs = await utilsHuyHieu.insert(ten);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/delete/:id', permission.delete, async (req, res, next) => { 
    try {
        var rs = await utilsHuyHieu.delete(parseInt(req.params.id));
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});


module.exports = router;