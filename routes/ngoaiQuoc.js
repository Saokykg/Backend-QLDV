var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsHoSo = require('../Utils/utilsHoSo');
const utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const utilsThongBao = require('../Utils/utilsThongBao');
const share = require('../share');
const utilsLog = require('../Utils/utilsLog');
const permission = require('../middleware/permission');
const utilsNgoaiQuoc = require('../Utils/utilsNgoaiQuoc');


//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsNgoaiQuoc.getAllpure();
        rs = await share.decodeArray(rs[0]);
        if (!req.admin)
            rs = rs.filter( r => req.dshosoquanly.includes(r[`id hồ sơ`]));
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/list' , async (req,res, next) => {
    try {
        let rs = await utilsNgoaiQuoc.getAll();
        rs = await share.decodeArray(rs[0]);
        rs = await share.fillTable(rs);
        // console.log(rs);
        if (!req.admin)
            rs = rs.filter( r => req.dshosoquanly.includes(r[`id hồ sơ`]));

        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/id/:id' , async (req,res, next) => {
    try {
        let rs = await utilsNgoaiQuoc.getById(parseInt(req.params.id));
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
        let rs = await utilsNgoaiQuoc.getByIdHs(parseInt(req.params.id));
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
        const congtac = req.body.congtac;
        const userid = req.userid;
        const hanhdong = req.body.hanhdong;
        // console.log(congtac);
        // userid = 1;

        var ans = false;
        
        if (!req.admin)
        if (!req.dshosoquanly.includes(congtac[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        }

        var ct = new utilsNgoaiQuoc(congtac[`id`], congtac[`id hồ sơ`], congtac[`id số quyết định`], 
            congtac[`Loại`], congtac[`Ngày đi`], congtac[`Ngày về`], congtac[`Nội dung`], congtac[`Nơi đến`]);
        
        var oldct = await utilsNgoaiQuoc.getById(congtac[`id`]);
        oldct = oldct[0][0];
    
        var rs = await utilsNgoaiQuoc.update(userid, hanhdong, oldct, ct);
        if (rs != -1) ans = true;

        var s = new utilsSoQuyetDinh(congtac[`id số quyết định`], congtac[`Số quyết định`], congtac[`Ngày ban hành`], null);
        var oldsqd = await utilsSoQuyetDinh.getById(congtac[`id số quyết định`]);

        oldsqd = oldsqd[0][0];
        var rssql = await utilsSoQuyetDinh.update(userid, hanhdong, oldsqd, s);
        if (rssql != -1) ans = true;
        if (ans){
            res.statusCode = 200;
            res.statusMessage = 'Update success';
            messenger = "Cập nhật thành công";
            res.json({"res":messenger});    
        }
        else{
            res.statusCode = 200;
            res.statusMessage = 'NOT Update';
            messenger = "Không có thay đổi dữ liệu";
            res.json({"res":messenger});    
        }
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const congtac = req.body.congtac;
        const userid = req.userid;
        var idsqd = null;

        if (!req.admin)
        if (!req.dshosoquanly.includes(congtac[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        }
        if (congtac['Số quyết định'] != null && congtac['Số quyết định'] != undefined){
            var s = new utilsSoQuyetDinh(null, congtac[`Số quyết định`], congtac[`Ngày ban hành`], "Ngoại quốc");
            var rssql = await utilsSoQuyetDinh.insert(userid, s);
            idsqd = rssql[0][0].result;
        }
        
        var ct = new utilsNgoaiQuoc(null, congtac[`id hồ sơ`],idsqd, congtac[`Loại`], congtac[`Ngày đi`], congtac[`Ngày về`], 
                        congtac[`Nội dung`], congtac[`Nơi đến`]);
                        
        await utilsNgoaiQuoc.insert(userid, congtac[`Ngày ban hành`], ct);
        
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

// router.post('/mulInsert', permission.create, async (req, res, next) => { //not in use
//     try {
//         const congtacs = req.body.congtac;
//         var userid = req.userid;
//         // console.log(congtac);
//         for (const congtac of congtacs){
//             var idsqd = null;

//             if (congtac['Số quyết định'] != null && congtac['Số quyết định'] != undefined){
//                 var s = new utilsSoQuyetDinh(null, congtac[`Số quyết định`], congtac[`Ngày ban hành`], "Ngoại quốc");
//                 var rssql = await utilsSoQuyetDinh.insert(userid, s);
//                 idsqd = rssql[0][0].result;
//             }
            
//             var ct = new utilsNgoaiQuoc(null, congtac[`id hồ sơ`],idsqd, congtac[`Loại`], congtac[`Ngày đi`], congtac[`Ngày về`], 
//                             congtac[`Nội dung`], congtac[`Nơi đến`]);
                            
//             await utilsNgoaiQuoc.insert(userid, congtac[`Ngày ban hành`], ct);
//         }
        
//         res.statusCode = 201;
//         res.statusMessage = 'Create success';
//         messenger = "Thêm thành công";
//         res.json({"res":messenger});

//     } catch (err) {
//         await share.errorMailer(req, res, next, err.stack.toString());
//         console.log(err);
//         res.json(err);
//     }
// });

router.post('/insert/list', permission.create, async (req, res, next) => { 
    try {
        const congtac = req.body.congtac;
        // console.log(thanhtich);
        var idsqd = null;
        var list = congtac[`id hồ sơ`];
        if (!req.admin)
        for (const obj of list){
            if (!req.dshosoquanly.includes(obj)){
                res.sendStatus(403);
                return;
            }
        }

        if (congtac['Số quyết định'] != null && congtac['Số quyết định'] != undefined){
            var s = new utilsSoQuyetDinh(null, congtac[`Số quyết định`], congtac[`Ngày ban hành`], "Ngoại quốc");
            var rssql = await utilsSoQuyetDinh.insert(userid, s);
            idsqd = rssql[0][0].result;
        }
        
        
        for (const obj of list){
            var ct = new utilsNgoaiQuoc(null, obj, idsqd, congtac[`Loại`], congtac[`Ngày đi`], congtac[`Ngày về`], 
                            congtac[`Nội dung`], congtac[`Nơi đến`]);
                            
            await utilsNgoaiQuoc.insert(userid, congtac[`Ngày ban hành`], ct);
        }
        
        res.statusCode = 201;
        res.statusMessage = 'Create success';
        messenger = "Thêm thành công";
        res.json({"res":messenger});
    
        res.json(rs[0]);
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
            var ct = await utilsNgoaiQuoc.getById(id)
            ct = ct[0][0];
            if (!req.admin && !req.dshosoquanly.includes(ct["id hồ sơ"])){
                fail.push(id)
            }
            else{
                let rs = await utilsNgoaiQuoc.delete(id);
                if (rs[0].affectedRows == 1){
                    await utilsLog.deleteAction(req.userid, 'congtacngoaiquoc', id);
                    success.push(id);
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
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.statusCode = 400;
        res.json(err);
    }
})

router.delete('/deleteByIdHS/:id' , permission.delete, async (req,res, next) => {
    try {
        if (!req.admin && !req.dshosoquanly.includes(parseInt(req.params.id))){
            res.sendStatus(403);
            return;
        }
        let rs = await utilsNgoaiQuoc.deleteByIdHS(parseInt(req.params.id));
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

//import
router.post('/import' , permission.create, async (req,res, next) => {
    try {
        const ngoaiquoc = req.body.ngoaiquoc;
        const userid = req.userid;
        var i = 1;
        var fail=[];
        while(ngoaiquoc[i] != undefined ){
            if (ngoaiquoc[i][0]!=undefined)
            {
                var idHoso = await utilsHoSo.getBySTD(ngoaiquoc[i][0]);
                idHoso = idHoso[0][0].id;
                
                if (!req.admin && !req.dshosoquanly.includes(idhs)){
                    fail.push(ngoaiquoc[i][0]);
                }
                else{
                    var ngay = (ngoaiquoc[i][3] != null) ? ngoaiquoc[i][3].split('/').join('-') : null;
                    var sqd = new utilsSoQuyetDinh(null, ngoaiquoc[i][2], ngay, "ngoaiquoc");
                    var idsqd = await utilsSoQuyetDinh.insert(userid, sqd);
                    idsqd = idsqd[0][0].result;
                    var ngaydi = (ngoaiquoc[i][5] != null) ? ngoaiquoc[i][5].split('/').join('-') : null;
                    var ngayve = (ngoaiquoc[i][6] != null) ? ngoaiquoc[i][6].split('/').join('-') : null;
                    var ngoai = new utilsNgoaiQuoc(null, idHoso, idsqd, ngoaiquoc[i][4], ngaydi, ngayve, 
                    ngoaiquoc[i][7], ngoaiquoc[i][8]);
                    await utilsNgoaiQuoc.insert(userid, ngay, ngoai);
                }
            }
            i++;
        }
        if (fail.length==0)
            res.json({"res":"Thành công"});
        else{
            res.json({"res":"thêm thất bại", "fail":fail})
        }
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

module.exports = router;