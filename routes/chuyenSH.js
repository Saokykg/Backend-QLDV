var express = require('express');
const utils = require('../middleware/utils');
const utilsChiBo = require('../Utils/utilsChiBo');
const utilsChucVu = require('../Utils/utilsChucVu');
var router = express.Router();
var utilsChuyenSH = require('../Utils/utilsChuyenSH');
const utilsHoSo = require('../utils/utilsHoSo');
const utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const utilsLog = require('../Utils/utilsLog');
const share = require('../share');
const utilsthongbao = require('../Utils/utilsThongBao');
const permission = require('../middleware/permission');

//middleware for checking access token
router.use(permission.read);

router.get('/' , async (req,res, next) => {
    try {
        let rs = await utilsChuyenSH.getAllpure();
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
        let rs = await utilsChuyenSH.getAll();
        rs = await share.decodeArray(rs[0]);
        rs = await share.fillTable(rs);
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
        let rs = await utilsChuyenSH.getById(parseInt(req.params.id));
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
        let rs = await utilsChuyenSH.getByIdHS(parseInt(req.params.id));
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

        const chuyensh = req.body.chuyensh; //chuyensh
        var hanhdong = req.body.hanhdong;
        var userid = req.userid;

        var ans = false;
        if (!req.admin)
        if (!req.dshosoquanly.includes(chuyensh[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        }
        // console.log(chuyensh);
        
        var c = new utilsChuyenSH(chuyensh[`id`], chuyensh[`id hồ sơ`], chuyensh[`id số quyết định`], chuyensh[`Ngày đi`], 
                        chuyensh[`Loại chuyển`], chuyensh[`Chuyển từ`], chuyensh[`Chuyển đến`]);

        var oldchuyensh = await utilsChuyenSH.getById(chuyensh[`id`]);

        oldchuyensh = await share.decodeArray(oldchuyensh[0]);
        oldchuyensh = oldchuyensh[0];
        var rs = await utilsChuyenSH.update(userid, hanhdong, oldchuyensh, c);
        if (rs != -1) ans = true;
    
        var s = new utilsSoQuyetDinh(chuyensh[`id số quyết định`], chuyensh[`Số quyết định`], chuyensh[`Ngày ban hành`], null);
        var oldsqd = await utilsSoQuyetDinh.getById(chuyensh[`id số quyết định`]);
        oldsqd = oldsqd[0][0];

        var rssql = await utilsSoQuyetDinh.update(userid, hanhdong, oldsqd, s);
        if (rssql != -1) ans = true;
        
        var today = new Date();
        var datetrans = new Date(chuyensh[`Ngày đi`].split('-').reverse().join('-'));
        
        switch (oldchuyensh[`Loại chuyển`]){
            case 'Nội bộ':
                var chibo = await utilsChiBo.getByName(oldchuyensh[`Chuyển đến`]);
                chibo = chibo[0][0].id;
                await utilsHoSo.deleteLogHoso(chuyensh[`id hồ sơ`], chibo, oldchuyensh[`Ngày đi`], 'Chi bộ');
                break;
            default:
                await utilsHoSo.deleteLogHoso(chuyensh[`id hồ sơ`], '0', oldchuyensh[`Ngày đi`], 'Active');
        }

        if (today >= datetrans){
            var action_id = await utilsHoSo.insertAction(userid, chuyensh[`id`]);
            action_id = action_id[0][0].id
            switch(chuyensh[`Loại chuyển`]){
                case 'Nội bộ': 
                    var chibo = await utilsChiBo.getByName(chuyensh[`Chuyển đến`]);
                    chibo = chibo[0][0].id;
                    await utilsHoSo.updateChuyenSH(chuyensh[`id hồ sơ`],  chibo, userid, chuyensh[`Ngày đi`], action_id);
                    break;
                default :
                    await utilsHoSo.updateActive(chuyensh[`id hồ sơ`], 0, userid, chuyensh[`Ngày đi`], action_id);
            }
        }
        await utilsHoSo.updateNewChibo(chuyensh[`id hồ sơ`]);


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
        console.log(messenger);
        res.json({"res":messenger});    

    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const chuyensh = req.body.chuyensh;
        var userid = req.userid;
        if (!req.admin)
        if (!req.dshosoquanly.includes(chuyensh[`id hồ sơ`])){
            res.sendStatus(403);
            return;
        }

        var idsqd = null;
        var s = new utilsSoQuyetDinh(null, chuyensh[`Số quyết định`], chuyensh[`Ngày ban hành`], "Chuyển sinh hoạt");
        var rssql = await utilsSoQuyetDinh.insert(userid, s);
        idsqd = rssql[0][0].result;

        var c = new utilsChuyenSH(null , chuyensh[`id hồ sơ`], idsqd, chuyensh[`Ngày đi`], 
                chuyensh[`Loại chuyển`], chuyensh[`Chuyển từ`], chuyensh[`Chuyển đến`]);
        
        var rs = await utilsChuyenSH.insert(userid, chuyensh[`Ngày ban hành`], c);
        rs = rs[0][0].result;

        var today = new Date();
        var datetrans = new Date(chuyensh[`Ngày đi`].split('-').reverse().join('-'));
        
        if (today >= datetrans){
            var action_id = await utilsHoSo.insertAction(userid, rs);
            action_id = action_id[0][0].id
            console.log("action_id: ",action_id, chuyensh)
            switch(chuyensh[`Loại chuyển`]){
                case 'Nội bộ': {
                    var chibo = await utilsChiBo.getByName(chuyensh[`Chuyển đến`]);
                    chibo = chibo[0][0].id;
                    await utilsHoSo.updateChuyenSH(chuyensh[`id hồ sơ`],  chibo, userid, chuyensh[`Ngày đi`], action_id);
                    break;
                }
                default :{
                    await utilsHoSo.updateActive(chuyensh[`id hồ sơ`], 0, userid, chuyensh[`Ngày đi`], action_id);
                }
            }
        }
        
        await utilsHoSo.updateNewChibo(chuyensh[`id hồ sơ`]);

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

// router.post('/mulInsert', permission.create, async (req, res, next) => { //tam ko xu dung
//     try {
//         const chuyenshs = req.body.chuyensh;
//         for (const chuyensh of chuyenshs){
//             var idsqd = null;
//             var s = new utilsSoQuyetDinh(null, chuyensh[`Số quyết định`], chuyensh[`Ngày ban hành`], "Chuyển sinh hoạt");
//             var rssql = await utilsSoQuyetDinh.insert(userid, s);
//             idsqd = rssql[0][0].result;

//             var c = new utilsChuyenSH(null, chuyensh[`id hồ sơ`], idsqd, chuyensh[`Ngày đi`], 
//                     chuyensh[`Loại chuyển`], chuyensh[`Chuyển từ`], chuyensh[`Chuyển đến`]);
            
//             var rs = await utilsChuyenSH.insert(userid, chuyensh[`Ngày ban hành`], c);
//             rs = rs[0][0].result;

//             var today = new Date();
//             var datetrans = new Date(chuyensh[`Ngày đi`].split('-').reverse().join('-'));

//             if (today >= datetrans){
//                 var action_id = await utilsHoSo.insertAction(userid, rs);
//                 action_id = action_id[0][0].id
//                 switch(chuyensh[`Loại chuyển`]){
//                     case 'Nội bộ': {
//                         var chibo = await utilsChiBo.getByName(chuyensh[`Chuyển đến`]);
//                         chibo = chibo[0][0].id;
//                         await utilsHoSo.updateChuyenSH(chuyensh[`id hồ sơ`],  chibo, userid, chuyensh[`Ngày đi`], action_id);
//                     }
//                     default :{
//                         await utilsHoSo.updateActive(chuyensh[`id hồ sơ`], 0, userid, chuyensh[`Ngày ban hành`], action_id);
//                     }
//                 }
//             }
//             await utilsHoSo.updateNewChibo(chuyensh[`id hồ sơ`]);
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
        const chuyensh = req.body.chuyensh;
        var userid = req.userid;
        var idsqd = null;
        var s = new utilsSoQuyetDinh(null, chuyensh[`Số quyết định`], chuyensh[`Ngày ban hành`], "Chuyển sinh hoạt");
        var rssql = await utilsSoQuyetDinh.insert(userid, s);
        idsqd = rssql[0][0].result;
        
        var list = chuyensh[`id hồ sơ`];
        // console.log(list);
        
        for (const obj of list){
            if (!req.admin)
            if (!req.dshosoquanly.includes(obj)){
                res.sendStatus(403);
                return;
            }
        }
        for (const obj of list){
            var c = new utilsChuyenSH(null, obj, idsqd, chuyensh[`Ngày đi`], 
                chuyensh[`Loại chuyển`], chuyensh[`Chuyển từ`], chuyensh[`Chuyển đến`]);
            var rs = await utilsChuyenSH.insert(userid, chuyensh[`Ngày ban hành`], c);
            rs = rs[0][0].result;

            var today = new Date();
            var datetrans = new Date(chuyensh[`Ngày đi`].split('-').reverse().join('-'));

            if (today >= datetrans){
                var action_id = await utilsHoSo.insertAction(userid, rs);
                action_id = action_id[0][0].id
                console.log("action_id: ",action_id, chuyensh)
                switch(chuyensh[`Loại chuyển`]){
                    case 'Nội bộ': {
                        await utilsHoSo.updateChuyenSH(obj,  chuyensh[`Chuyển đến`], userid, chuyensh[`Ngày đi`], action_id);
                        break;
                    }
                    default :{
                        await utilsHoSo.updateActive(obj, 0, userid, chuyensh[`Ngày ban hành`], action_id);
                    }
                }
            }
            await utilsHoSo.updateNewChibo(obj);
        }

        res.statusCode = 201;
        res.statusMessage = 'Create success';
        messenger = "Thêm thành công";
        res.json({"res":messenger});
        
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json({"error":"Lỗi server vui lòng thử lại sau."});
    }
});

router.delete('/delete/:id', permission.edit, async (req, res, next) => { 
    try {
        var ids = req.params.id.split(',');
        var success =[];
        var fail =[];
        for (var id of ids){
            id = parseInt(id);
            var oldchuyensh = await utilsChuyenSH.getById(id);
            oldchuyensh = await share.decodeArray(oldchuyensh[0]);
            oldchuyensh = oldchuyensh[0]

            if (!req.admin && !req.dshosoquanly.includes(oldchuyensh[`id hồ sơ`])){
                fail.push(id)
            }
            else{
                let rs = await utilsChuyenSH.delete(id);
                if (rs[0].affectedRows != 0){
                    await utilsLog.deleteAction(req.userid, 'chuyensh', id);
                    success.push(id);
                    var today = new Date();
                    var datetrans = new Date(oldchuyensh[`Ngày đi`].split('-').reverse().join('-'));
                    if (today > datetrans)
                        switch (oldchuyensh[`Loại chuyển`]){
                            case 'Nội bộ':
                                var chibo = await utilsChiBo.getByName(oldchuyensh[`Chuyển đến`]);
                                chibo = chibo[0][0].id;
                                await utilsHoSo.deleteLogHoso(oldchuyensh[`id hồ sơ`], chibo, oldchuyensh[`Ngày đi`], 'Chi bộ');
                                break;
                            default:
                                await utilsHoSo.deleteLogHoso(oldchuyensh[`id hồ sơ`], '0', oldchuyensh[`Ngày đi`], 'Active');
                        }
                    await utilsHoSo.updateNewChibo(oldchuyensh[`id hồ sơ`]);
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
        res.statusCode = 400;
        console.log(err);
        res.json(err);
    }
});

router.delete('/deleteByIdHS/:id', permission.delete, async (req, res, next) => { 
    try {
        if (!req.admin && !req.dshosoquanly.includes(parseInt(req.params.id))){
            res.sendStatus(403);
            return;
        }
        var rs = await utilsChuyenSH.deleteByIdHS(parseInt(req.params.id));
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

// import
router.post('/import', permission.create , async (req,res, next) => {
    try {
        const chuyensh = req.body.chuyensh;
        const userid = req.userid;
        var i = 1;
        var fail = [];
        while(chuyensh[i] != undefined){
            if (i ==2) break;
            if (chuyensh[i][0] != undefined){ 
                var idHoso = await utilsHoSo.getBySTD(chuyensh[i][0]);
                idHoso = idHoso[0][0].id;
                if (!req.admin && !req.dshosoquanly.includes(idHoso)){
                    fail.push(id)
                }
                else{
                    var ngay =  (chuyensh[i][10] != null) ?  chuyensh[i][10].split('/').join('-') : null;
                    var sqd = new utilsSoQuyetDinh(null, chuyensh[i][9], ngay, "chuyensh");
                    var idsqd = await utilsSoQuyetDinh.insert(userid, sqd);
                    idsqd = idsqd[0][0].result;
                    var tu, den;
                    if (chuyensh[i][5] == 'Nội bộ'){
                        tu = await utilsChiBo.getByName(chuyensh[i][6]);
                        tu = tu[0][0].id;
                        den = await utilsChiBo.getByName(chuyensh[i][7]);
                        den = den[0][0].id;
                    }
                    else{ 
                        tu = chuyensh[i][6];
                        den = await utilsChiBo.getByName(chuyensh[i][7]);
                        den = den[0][0].id;
                    }
                    var ngaydi =  (chuyensh[i][8] != null) ?  chuyensh[i][8].split('/').join('-') : null;
                    var chuyen = new utilsChuyenSH(null, idHoso, idsqd, ngaydi, chuyensh[i][5], tu, den);
                    var rs = await utilsChuyenSH.insert(userid, ngay, chuyen);
                    rs = rs[0][0].result;
                    
                    var today = new Date();
                    var datetrans = new Date(ngaydi);

                    if (today >= datetrans){
                        var action_id = await utilsHoSo.insertAction(userid, rs);
                        action_id = action_id[0][0].id
                        switch(chuyensh[i][5]){
                            case 'Nội bộ': 
                                console.log(userid, den, ngaydi);
                                await utilsHoSo.updateChuyenSH(idHoso,  den, userid, ngaydi, action_id);
                                break;
                            default :
                                await utilsHoSo.updateActive(idHoso, 0, userid, ngaydi, action_id);
                        }
                    }
                    await utilsHoSo.updateNewChibo(idHoso);
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