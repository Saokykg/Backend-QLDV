var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsChucVu = require('../Utils/utilsChucVu');
const share = require('../share');
const permission = require('../middleware/permission');

//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsChucVu.getAll();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsChucVu.getById(req.params.id);
        res.json(rs[0][0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})


router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        const chucvu = req.body.chucvu; //chucvu.id va chucvu.ten
        var rs = await utilsChucVu.update(chucvu["id"],chucvu["Tên"]); 
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const chucvu = req.body.chucvu;
        var rs = await utilsChucVu.insert(chucvu["Tên"]);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/delete/:id' , permission.delete, async (req,res, next) => {
    try {
        var ids = req.params.id.split(',');
        var array_id = [];
        for (const id of ids){
            array_id.push(parseInt(id));
        }
        let rs = await utilsChucVu.delete(req.body.userid, array_id);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

module.exports = router;