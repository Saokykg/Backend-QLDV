var express = require('express');
const utils = require('../middleware/utils');
const utilsTonGiao = require('../Utils/utilsTonGiao');
var router = express.Router();
const share = require('../share');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        var rs = await utilsTonGiao.getAll();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        var tongiao = req.body.tongiao;
        var tg = new utilsTonGiao(tongiao[`id`], tongiao[`Tôn giáo`])
        var rs = await utilsTonGiao.update(tg);
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
        var tongiao = req.body.tongiao;
        var tg = new utilsTonGiao(null, tongiao[`Tôn giáo`])
        var rs = await utilsTonGiao.insert(tg);
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
        var rs = await utilsTonGiao.delete(req.params.id);
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
        var rs = await utilsTonGiao.getById(req.params.id);
        rs = rs[0];
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})


module.exports = router;