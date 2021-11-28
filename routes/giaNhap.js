var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsGiaNhap = require('../Utils/utilsGiaNhap');
const share = require('../share');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsGiaNhap.getAllpure();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/list' , async (req,res, next) => {
    try {
        let rs = await utilsGiaNhap.getAll();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/lower2' , async (req,res, next) => {
    try {
        let rs = await utilsGiaNhap.getWithCount();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
        var ans = rs.filter(r =>{
            return r[`count`] < 2
        })
        res.json(ans);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsGiaNhap.getById(req.params.id);
        rs = await share.decodeArray(rs[0]);
        // console.log(rs);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/idHoso/:id' , async (req,res, next) => {
    try {
        let rs = await utilsGiaNhap.getByIdHS(req.params.id);
        rs = await share.decodeArray(rs[0]);
        // console.log(rs);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/idloai/:id/:loai' , async (req,res, next) => {// loai 0 - du bi ; 1 - chinh thuc
    try {
        let rs = await utilsGiaNhap.get(req.params.id, req.params.loai);
        rs = await share.decodeArray(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        const listgianhaps = req.body.gianhap; //danh sach lien lac
        for (const gianhap of listgianhaps){
            var gn = new utilsGiaNhap(gianhap['id'], gianhap[`Loại`], gianhap[`Ngày gia nhập`], gianhap[`Nơi gia nhập`]);
            var rs = await utilsGiaNhap.update(gn);
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const listgianhaps = req.body.gianhap; //danh sach lien lac
        for (const gianhap of listgianhaps){
            // if (giânh)
            var gn = new utilsGiaNhap(gianhap['id'], gianhap[`Loại`], gianhap[`Ngày gia nhập`], gianhap[`Nơi gia nhập`]);
            var rs = await utilsGiaNhap.insert(gn);
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/delete/:idHs/:type', permission.delete, async (req, res, next) => {
    try {
        var id = req.params.idHs;
        var type = req.params.type;
        var rs = await utilsGiaNhap.delete(id, type);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});


module.exports = router;