var express = require('express');
const permission = require('../middleware/permission');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsChucVu = require('../Utils/utilsChucVu');
var utilsDonVi = require('../Utils/utilsdonvi');
var share = require('../share');
const utilsDonVi_ChucVu = require('../Utils/utilsDonVi_ChucVu');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsDonVi.getAll();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/loai' , async (req,res, next) => {
    try {
        let rs = await utilsDonVi.getLoai();
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsDonVi.getById(req.params.id);
        let rs2 = await utilsDonVi_ChucVu.getChucVuDonVi(req.params.id);
        var list = [];
        for(const r of rs2[0]){
            list.push(r.id)
        }
        rs[0][0].chucvu = list;
        res.json(rs[0][0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.post('/insert' , async (req,res, next) => {
    try {
        var dvid;
        var donvi = req.body.donvi;
        if (!donvi || !donvi[`Tên`] || !donvi[`Loại`]){
            res.sendStatus(403);
            return;
        }
        var cv = await utilsChucVu.getAll();
        cv = cv[0];
        let list = [];
        
        for (const c of cv){
            list.push(c[`id`]);
        }

        for (const cv of donvi[`chucvu`]){
            if (!list.includes(cv)){
                res.sendStatus(400);
                return;
            }
        }

        var dv = new utilsDonVi(null, donvi[`Tên`], donvi[`Loại`]);
        let rs = await utilsDonVi.insert(dv);
        dvid = rs[0].insertId;

        for (const cv of donvi[`chucvu`]){
            await utilsDonVi_ChucVu.insert(new utilsDonVi_ChucVu(null, dvid, cv));
        }

        res.json(rs[0]);
    } catch (err) {
        if (dvid){
            await utilsDonVi.delete(dvid)
        }
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.put('/update' , async (req,res, next) => {
    try {
        var donvi = req.body.donvi;
        if (!donvi || !donvi[`id`] ||!donvi[`Tên`] || !donvi[`Loại`]){
            res.sendStatus(403);
            return;
        }

        var cv = await utilsChucVu.getAll();
        cv = cv[0];
        let list = [];
        for (const c of cv){
            list.push(c[`id`]);
        }

        for (const cv of donvi[`chucvu`]){
            if (!list.includes(cv)){
                res.sendStatus(400);
                return;
            }
        }

        var dv = new utilsDonVi(donvi[`id`], donvi[`Tên`], donvi[`Loại`]);
        let rs = await utilsDonVi.update(dv);

        await utilsDonVi_ChucVu.deleteByDonvi(donvi[`id`]);
        for (const cv of donvi[`chucvu`]){
            await utilsDonVi_ChucVu.insert(new utilsDonVi_ChucVu(null, dv[`id`], cv));
        }

        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.put('/active', async (req,res, next) => {
    try {
        var donvi = req.body.id
        var ids = [];
        for (const dv of donvi){
            ids.push(parseInt(dv))
            if (isNaN(parseInt(dv))){
                res.sendStatus(400);
                return;
            }
        }
        var rs = await utilsDonVi.active(ids);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.put('/deactive', async (req,res, next) => {
    try {
        var donvi = req.body.id;
        var ids = [];
        for (const dv of donvi){
            ids.push(parseInt(dv))
            if (isNaN(parseInt(dv))){
                res.sendStatus(400);
                return;
            }
        }
        var rs = await utilsDonVi.deactive(ids);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.put('/delete/:id', async (req,res, next) => {
    var donvi = req.params.id
    for (const dv of donvi){
        rs = await utilsDonVi.delete(donvi);
    }
    res.json(rs[0]);
})

module.exports = router;