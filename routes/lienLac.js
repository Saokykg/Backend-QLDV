var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsLienLac = require('../Utils/utilsLienLac');
const share = require('../share');
const permission = require('../middleware/permission');


//middleware for checking access token
// router.use(utils.authenticateToken);
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        console.log(req);
        let rs = await utilsLienLac.getAll();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/idHoSo/:id' , async (req,res, next) => {
    try {
        let rs = await utilsLienLac.getByIdHS(req.params.id);
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
        let rs = await utilsLienLac.getById(req.params.id);
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
        const lienlacs = req.body.lienlac; //danh sach lien lac
        var list = [];
        for (const lienlac of lienlacs){
            var ll = new utilsLienLac(lienlac[`id`], lienlac[`id hố sơ`], lienlac[`loại`], lienlac[`địa chỉ`], lienlac[`level`]);
            list.push(ll);
        }
        var rs = await utilsLienLac.update(list);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const listlienlac = req.body.lienlac; 
        for (const lienlac of listlienlac){
            var ll = new utilsLienLac(null, lienlac[`id hố sơ`], lienlac[`loại`], lienlac[`địa chỉ`], lienlac[`level`]);
            var rs = await utilsLienLac.insert(ll);
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/delete/:id', permission.delete, async (req, res, next) => { 
    try {
        var rs = await utilsLienLac.delete(req.params.id);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});


module.exports = router;