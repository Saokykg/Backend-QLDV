var express = require('express');
const utils = require('../middleware/utils');
const utilsTrangThai = require('../Utils/utilsTrangThai');
var router = express.Router();
const share = require('../share');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        var rs = await utilsTrangThai.getAll();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/:id' , async (req,res, next) => {
    try {
        var rs = await utilsTrangThai.getById(req.params.id);
        rs = rs[0];
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        var trangthai = req.body.trangthai;
        var tt = new utilsTrangThai(trangthai[`id`], trangthai[`Trạng thái`])
        var rs = await utilsTrangThai.update(tt);
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
        var trangthai = req.body.trangthai;
        // console.log(trangthai);
        var tt = new utilsTrangThai(null, trangthai[`Trạng thái`])
        var rs = await utilsTrangThai.insert(tt);
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
        var rs = await utilsTrangThai.delete(req.params.id);
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});


module.exports = router;