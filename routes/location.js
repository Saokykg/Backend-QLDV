var express = require('express');
const utils = require('../middleware/utils');
const { decodeArray } = require('../share');
var router = express.Router();
var utilsLocation = require('../Utils/utilsLocation');
const share = require('../share');
const { route } = require('./import');
const permission = require('../middleware/permission');


//middleware for checking access token
router.use(permission.read);

router.get('/province' , async (req,res, next) => {
    try {
        let rs = await utilsLocation.getProvince();
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/district/:id' , async (req,res, next) => {
    try {
        var id= req.params.id.toString(); 
        let rs = await utilsLocation.getDistrict(id);
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/district' , async (req,res, next) => {
    try {
        let rs = await utilsLocation.getFullDistrict();
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/ward/:id' , async (req,res, next) => {
    try {
        var id= req.params.id.toString();
        let rs = await utilsLocation.getWard(id);
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/ward' , async (req,res, next) => {
    try {
        let rs = await utilsLocation.getFullWard();
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/info/:id' , async (req,res, next) => {
    try {
        var id= req.params.id.toString();
        let rs = await utilsLocation.getFullinfo(id);
        rs = rs[0];
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/listProvince',async (req,res, next) => {
    try {
        var rs = await utilsLocation.getListProvince();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/listProvince/:id',async (req,res, next) => {
    try {
        var rs = await utilsLocation.getProvinceId(req.params.id.toString());
        rs = await share.decodeArray(rs[0]);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/province/insert', permission.create,async (req,res, next) => {
    try {
        var province = req.body.province;
        try {
            var rs = await utilsLocation.insertProvince(province.id, province.name);
        } catch (error) {
            res.json({"error":"Mã Tỉnh/Thành bị trùng"});
            return;
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/province/update', permission.edit,async (req,res, next) => {
    try {
        var province = req.body.province;
        try {
            var rs = await utilsLocation.updateProvince(province.id, province.name, province.idOld);
        } catch (error) {
            res.json({"error":"Mã Tỉnh/Thành bị trùng"});
            return;
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.delete('/province/delete/:id', permission.delete,async (req,res, next) => {
    try {
        var rs = await utilsLocation.deleteProvince(req.params.id.toString());
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/listDistrict',async (req,res, next) => {
    try {
        var rs = await utilsLocation.getListDistrict();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/listDistrict/:id',async (req,res, next) => {
    try {
        var rs = await utilsLocation.getDistrictId(req.params.id.toString());
        rs = await share.decodeArray(rs[0]);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/district/insert', permission.create,async (req,res, next) => {
    try {
        var district = req.body.district;
        try {
            var rs = await utilsLocation.insertDistrict(district.id, district.name, district.province_id );
        } catch (error) {
            res.json({"error":"Mã Quận/Huyện bị trùng"});
            return;
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/district/update', permission.edit,async (req,res, next) => {
    try {
        var district = req.body.district;
        try {
            var rs = await utilsLocation.updateDistrict(district.id, district.name, district.province_id, district.idOld);
        } catch (error) {
            res.json({"error":"Mã Quận/Huyện bị trùng"});
            return;
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.delete('/district/delete/:id', permission.delete,async (req,res, next) => {
    try {
        var rs = await utilsLocation.deleteDistrict(req.params.id.toString());
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/listWard',async (req,res, next) => {
    try {
        var rs = await utilsLocation.getListWard();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/listWard/:id',async (req,res, next) => {
    try {
        var rs = await utilsLocation.getWardId(req.params.id.toString());
        rs = await share.decodeArray(rs[0]);
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/ward/insert', permission.create,async (req,res, next) => {
    try {
        var ward = req.body.ward;
        try {
            var rs = await utilsLocation.insertWard(ward.id, ward.name, ward.district_id );
        } catch (error) {
            res.json({"error":"Mã Tỉnh/Thành bị trùng"});
            return;
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/ward/update', permission.edit,async (req,res, next) => {
    try {
        var ward = req.body.ward;
        try {
            var rs = await utilsLocation.updateWard(ward.id, ward.name, ward.district_id, ward.idOld);
        } catch (error) {
            res.json({"error":"Mã Tỉnh/Thành bị trùng"});
            return;
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.delete('/ward/delete/:id', permission.delete,async (req,res, next) => {
    try {
        var rs = await utilsLocation.deleteWard(req.params.id.toString());
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

module.exports = router;