var express = require('express');
const utils = require('../middleware/utils');
const utilsDanToc = require('../Utils/utilsDanToc');
var router = express.Router();
const share = require('../share');
const permission = require('../middleware/permission');

//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        var rs = await utilsDanToc.getAll();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        var dantoc = req.body.dantoc;
        console.log(req.body);
        var dt = new utilsDanToc(dantoc[`id`], dantoc[`Dân tộc`])
        var rs = await utilsDanToc.update(dt);
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
        var dantoc = req.body.dantoc;
        var dt = new utilsDanToc(null, dantoc[`Dân tộc`])
        var rs = await utilsDanToc.insert(dt);
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
        var rs = await utilsDanToc.delete(req.params.id);
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
        var rs = await utilsDanToc.getById(req.params.id);
        rs = rs[0];
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

module.exports = router;