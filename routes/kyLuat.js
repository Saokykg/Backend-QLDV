var express = require('express');
const utils = require('../middleware/utils');
const utilHoSo = require('../utils/utilsHoSo');
var router = express.Router();
var utilsKyLuat = require('../Utils/utilsKyLuat');
const utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const share = require('../share');
const permission = require('../middleware/permission');
const utilsLog = require('../Utils/utilsLog');
const utilsLienLac = require('../utils/utilsLienLac');
const utilsHoSo_ChucVu = require('../utils/utilsHoSo_ChucVu');

//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsKyLuat.getAllpure();
        rs = await share.decodeArray(rs[0]);
        if (!req.admin)
            rs = rs.filter(r => req.dshosoquanly.includes(r[`id hồ sơ`]))
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})
router.get('/list' , async (req,res, next) => {
    try {
        let rs = await utilsKyLuat.getAll();
        rs = await share.decodeArray(rs[0]);
        rs = await share.fillTable(rs);
        if (!req.admin)
            rs = rs.filter(r => req.dshosoquanly.includes(r[`id hồ sơ`]))
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
        let rs = await utilsKyLuat.getById(parseInt(req.params.id));
        rs = await share.decodeArray(rs[0]);
        if (!req.admin)
        if (!req.dshosoquanly.includes(rs[0][`id hồ sơ`])){
            res.sendStatus(403);
            return;
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/idHoSo/:id' , async (req,res, next) => {
    try {
        
        if (!req.admin)
        if (!req.dshosoquanly.includes(parseInt(req.params.id))){
            res.sendStatus(403);
            return;
        }
        let rs = await utilsKyLuat.getByIdHS(parseInt(req.params.id));
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        const kyluat = req.body.kyluat; //kyluat
        var userid = req.userid;
        var hanhdong = req.body.hanhdong;
        // console.log(kyluat);
        var ans = false;

        if (!req.admin)
        if (!req.dshosoquanly.includes(kyluat[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        }
        var kl = new utilsKyLuat(kyluat[`id`], kyluat[`id hồ sơ`], kyluat[`id số quyết định`], 
                        kyluat[`Hình thức kỷ luật`],kyluat[`Nội dung`], kyluat[`Ngày`], kyluat[`Ghi chú`]);
        
        var oldkl = await utilsKyLuat.getById(kyluat[`id`]);                    
        oldkl = await share.decodeArray(oldkl[0]);
        oldkl = oldkl[0];
        if (oldkl['Hình thức kỷ luật'] == 'Khai trừ' )
            await utilHoSo.deleteLogHoso(kyluat[`id hồ sơ`], 3, oldkl[`Ngày`], 'Trạng thái');

        var today = new Date();
        var datetrans = new Date(kyluat[`Ngày`].split('-').reverse().join('-'));

        var hinhthuc = kyluat[`Hình thức kỷ luật`];
        if (hinhthuc == 'Khai trừ' && datetrans <= today){
            var action_id = await utilHoSo.insertAction(userid, kyluat[`id`]);
            action_id = action_id[0][0].id;
            await utilHoSo.updateActive(kyluat['id hồ sơ'], 0, userid, kyluat[`Ngày`], action_id);
            await utilHoSo.updateTrangThai(kyluat['id hồ sơ'], 3, userid, kyluat[`Ngày`], action_id);
        }

        var rs = await utilsKyLuat.update(userid, hanhdong, oldkl, kl);
        if (rs != -1) ans =true;

        var s = new utilsSoQuyetDinh(kyluat[`id số quyết định`], kyluat[`Số quyết định`], kyluat[`Ngày ban hành`], null);
        var oldsqd = await utilsSoQuyetDinh.getById(kyluat[`id số quyết định`]);
        oldsqd = oldsqd[0][0];

        var rssqd = await utilsSoQuyetDinh.update(userid, hanhdong, oldsqd, s);
        if (rssqd != -1) ans =true;

        if (ans){
            res.statusCode = 200;
            res.statusMessage = 'Update success';
            messenger = "Cập nhật thành công";
        }
        else{
            res.statusCode = 200;
            res.statusMessage = 'NOT Update';
            messenger = "Không có thay đổi dữ liệu";
        }
        res.json({"res":messenger});  
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const kyluat = req.body.kyluat;
        var userid = req.userid;
        var idsqd = null;

        if (!req.admin)
        if (!req.dshosoquanly.includes(kyluat[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        }
        var s = new utilsSoQuyetDinh(null, kyluat[`Số quyết định`], kyluat[`Ngày ban hành`], "Kỷ luật");
        var rssql = await utilsSoQuyetDinh.insert(userid, s);
        idsqd = rssql[0][0].result;


        var kl = new utilsKyLuat(null, kyluat[`id hồ sơ`], idsqd, 
                        kyluat[`Hình thức kỷ luật`],kyluat[`Nội dung`], kyluat[`Ngày`], kyluat[`Ghi chú`]);

        var rs = await utilsKyLuat.insert(userid, kyluat[`Ngày ban hành`], kl);
        rs = rs[0][0].result;

        var today = new Date();
        var datetrans = new Date(kyluat[`Ngày`].split('-').reverse().join('-'));

        var hinhthuc = kyluat[`Hình thức kỷ luật`];
        if (hinhthuc == 'Khai trừ' && datetrans <= today){
            var action_id = await utilHoSo.insertAction(userid, rs);
            action_id = action_id[0][0].id;
            await utilHoSo.updateActive(kyluat['id hồ sơ'], 0, userid, kyluat[`Ngày`], action_id);
            await utilHoSo.updateTrangThai(kyluat['id hồ sơ'], 3, userid, kyluat[`Ngày`], action_id)
            await utilHoSo.updateNewTrangThai(kyluat['id hồ sơ']);
        }

        res.statusCode = 201;
        res.statusMessage = 'Create success';
        messenger = "Thêm thành công";
        res.json({"res":messenger});
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.delete('/delete/:id', permission.delete , async (req,res, next) => {
    try {
        var ids = req.params.id.split(',');
        var success =[];
        var fail =[];
        for (var id of ids){
            id = parseInt(id);
            var oldkl = await utilsKyLuat.getById(id);
            if (oldkl[0].length==0){
                fail.push(id);
                continue;
            }
            oldkl= await share.decodeArray(oldkl[0]);
            oldkl=oldkl[0]
            
            if (!req.admin && !req.dshosoquanly.includes(oldkl[`id hồ sơ`])){
                fail.push(id);
            }
            else{
                var today = new Date();
                var datetrans = new Date(oldkl[`Ngày`].split('-').reverse().join('-'));

                var hinhthuc = oldkl[`Hình thức kỷ luật`];
                if (hinhthuc == 'Khai trừ' && datetrans <= today){
                    await utilHoSo.deleteLogHoso(oldkl[`id hồ sơ`], 3, oldkl[`Ngày`], 'Trạng thái');
                }

                let rs = await utilsKyLuat.delete(id);
                if (rs[0].affectedRows == 1){
                    success.push(id);
                    await utilsLog.deleteAction(req.userid, 'kyluat', id);
                }
                else
                    fail.push(id);
            }
        }
        res.statusCode = 202;
        res.statusMessage = 'Delete success';
        messenger = "Xóa thành công";
        res.json({"res":messenger, "success":success, "fail":fail});
    } catch (err) {
        res.statusCode = 400;
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.delete('/deleteByIdHS/:id', permission.delete , async (req,res, next) => {
    try {
        if (!req.admin && !req.dshosoquanly.includes(parseInt(req.params.id))){
            res.sendStatus(403);
            return;
        }
        let rs = await utilsKyLuat.deleteByIdHS(parseInt(req.params.id));
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})



module.exports = router;