var express = require('express');
const permission = require('../middleware/permission');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsChucVu = require('../Utils/utilsChucVu');
var utilsDonVi = require('../Utils/utilsdonvi');
var utilsDonVi_ChucVu = require('../Utils/utilsDonVi_ChucVu');
var share = require('../share')

//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsDonVi_ChucVu.getAllpure();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/list' , async (req,res, next) => {
    try {
        let rs = await utilsDonVi_ChucVu.getAll();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/id/:id' , async (req,res, next) => { // 
    try {
        let rs = await utilsDonVi_ChucVu.getChucVuDonVi(req.params.id);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.post('/insert' , async (req,res, next) => {
    try {
        var donvi = req.body.donvichucvu;
        if (!donvi || !donvi[`donvi`] || !donvi[`chucvu`]){
            res.sendStatus(403);
            return;
        }
        console.log("IN:");
        var dvcv = new utilsDonVi_ChucVu(null, donvi[`donvi`], donvi[`chucvu`]);
        let rs = await utilsDonVi_ChucVu.insert(dvcv);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.put('/update' , async (req,res, next) => {
    try {
        var donvi = req.body.donvichucvu;
        if (!donvi || !donvi[`id`] || !donvi[`donvi`] || !donvi[`chucvu`]){
            res.sendStatus(403);
            return;
        }
        var dv = new utilsDonVi_ChucVu(donvi[`id`], donvi[`donvi`], donvi[`chucvu`]);
        let rs = await utilsDonVi_ChucVu.update(dv);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/delete/:id' , async (req,res, next) => {
    var donvi = req.params.id
    donvi = await donvi.split(',')
    var ids = [];
    for (const dv of donvi){
        ids.push(parseInt(dv))
        if (isNaN(parseInt(dv))){
            res.sendStatus(400);
            return;
        }
    }
    var rs = await utilsDonVi_ChucVu.delete(ids);
    res.json(rs[0]);
});


module.exports = router;