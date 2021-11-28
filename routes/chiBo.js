var express = require('express');
const utils = require('../middleware/utils');
const utilsHoSo = require('../utils/utilsHoSo');
var router = express.Router();
var utilsChiBo = require('../Utils/utilsChiBo');
const share = require('../share');
const { compile } = require('morgan');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);


router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsChiBo.getAll();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsChiBo.getById(req.params.id);
        res.json(rs[0][0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        const chibo = req.body.chibo; //chibo.id, chibo.active va chibo.ten
        var cb = new utilsChiBo(chibo["id"], chibo["active"], chibo["Tên chi bộ"]);
        var rs = await utilsChiBo.update(cb);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    } 
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const chibo = req.body.chibo;
        // console.log(chibo);
        var cb = new utilsChiBo(null, chibo["active"], chibo["Tên chi bộ"])
        var rs = await utilsChiBo.insert(cb);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.put('/disActive', permission.edit, async (req, res, next) => { 
    try {
        var chibo = req.body.chibo;
        var rs = await utilsChiBo.active(chibo["id"], 0);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/active', permission.edit, async (req, res, next) => {
    try {
        var chibo = req.body.chibo;
        var rs = await utilsChiBo.active(chibo, 1);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.put('/deActive', permission.edit, async (req, res, next) => { 
    try {
        var chibo = req.body.chibo;
        var rs = await utilsChiBo.active(chibo, 0);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

module.exports = router;