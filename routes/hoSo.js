var express = require('express');
const utils = require('../middleware/utils');
const utilsHoSo = require('../utils/utilsHoSo');
var router = express.Router();
var hscv = require('../Utils/utilsHoSo_ChucVu');
var utilschucvu = require('../Utils/utilsChucVu');
const utilHoSo = require('../utils/utilsHoSo');
const utilsGiaNhap = require('../utils/utilsGiaNhap');
const utilsChuyenSH = require('../utils/utilsChuyenSH');
const utilsLienLac = require('../utils/utilsLienLac');
const utilsHoSo_HuyHieu = require('../utils/utilsHoSo_HuyHieu');
const utilsChiBo = require('../utils/utilsChiBo');
const utilsHoSo_ChucVu = require('../Utils/utilsHoSo_ChucVu');
const utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const utilsLocation = require('../Utils/utilsLocation');
const utilsLog = require('../Utils/utilsLog')
const utilsDonVi = require('../Utils/utilsdonvi');
const permission = require('../middleware/permission');
const fs = require('fs');
const path = require('path');
const { time } = require('console');
const { performance } = require('perf_hooks');
var crypto = require('crypto');
const thongbao = require('../thongbao');

var share = require('../share');
const { decodeArray } = require('../share');
const e = require('express');
const utilsthanhtich = require('../Utils/utilsThanhTich');
const utilsthongbao = require('../Utils/utilsThongBao');
const utilsDonVi_ChucVu = require('../Utils/utilsDonVi_ChucVu');
const { JsonWebTokenError } = require('jsonwebtoken');

//middleware for checking access token
// router.use(utils.authenticateToken);
// router.use(utils.filePermission);

router.use(permission.read);
router.get('/test' , async (req,res, next) => {
    try {
        var rs = await utilsHoSo.getAll();
        rs = await share.decodeArray(rs[0]);
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/' , async (req,res, next) => {
    try {
        var rs = await utilsHoSo.getAll();
        var rs = await share.decodeArray(rs[0]);
        if (!req.admin)
            rs = rs.filter( r => req.dshosoquanly.includes(r[`id`]));
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/list' , async (req,res, next) => {
    try {            
        var rs = await utilsHoSo.getAll();
        rs = await share.decodeArray(rs[0]);
        // console.log(rs);
        for (const hs of rs){
            var tmp = [
                {"D??? b???"      : hs[`db`]},
                {"Ch??nh th???c" : hs[`ct`]},
            ]
            hs[`Ng??y v??o ?????ng`] = tmp;
            var tmp1 =[
                {"Ph?????ng/X??"  : hs.wq},
                {"Qu???n/Huy???n" : hs.dq},
                {"T???nh/Th??nh" : hs.pq}
            ]
            hs[`Qu?? qu??n`] = tmp1;
            var tmp =[
                {"?????a ch???"    : hs.d},
                {"Ph?????ng/X??"  : hs.wo},
                {"Qu???n/Huy???n" : hs.do},
                {"T???nh/Th??nh" : hs.po}
            ]
            hs[`N??i ???`] = tmp;
            var tmp =[
                {"?????ng" : hs[`?????ng`]},
                {"Ch??nh quy???n" : hs[`Ch??nh quy???n`]},
                {"??o??n th???" : hs[`??o??n th???`]},
                {"Ki??m nhi???m" : hs[`Ki??m nhi???m`]}
            ];
            hs[`Ch???c v???`] = tmp;
            hs[`db`] = undefined;
            hs[`ct`] = undefined;
            hs[`po`] = undefined;
            hs[`pq`] = undefined;
            hs[`dp`] = undefined;
            hs[`dq`] = undefined;
            hs[`wo`] = undefined;
            hs[`wq`] = undefined;
            hs[`d`]  = undefined;
            hs[`do`]  = undefined;
            hs[`Ki??m nhi???m`] = undefined;   
            hs[`?????ng`] = undefined;
            hs[`Ch??nh quy???n`] = undefined;
            hs[`??o??n th???`] = undefined;
        }
        if (!req.admin)
            rs = rs.filter( r => req.dshosoquanly.includes(r[`id`]));
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/list/ngay/:dau/:cuoi' , async(req,res, next) =>{
    try {            
        var dau = req.params.dau;
        var cuoi = req.params.cuoi;
        console.log(dau, cuoi);
        var rs = await utilsHoSo.getAllKhoang(dau, cuoi);
        rs=rs[0];
        // console.log(rs);
        rs = await share.decodeArray(rs[0]);
        
        for (const hs of rs){
            var tmp = [
                {"D??? b???"      : hs[`db`]},
                {"Ch??nh th???c" : hs[`ct`]},
            ]
            hs[`Ng??y v??o ?????ng`] = tmp;
            var tmp1 =[
                {"Ph?????ng/X??"  : hs.wq},
                {"Qu???n/Huy???n" : hs.dq},
                {"T???nh/Th??nh" : hs.pq}
            ]
            hs[`Qu?? qu??n`] = tmp1;
            var tmp =[
                {"?????a ch???"    : hs.d},
                {"Ph?????ng/X??"  : hs.wo},
                {"Qu???n/Huy???n" : hs.do},
                {"T???nh/Th??nh" : hs.po}
            ]
            hs[`N??i ???`] = tmp;
            var tmp =[
                {"?????ng" : hs[`?????ng`]},
                {"Ch??nh quy???n" : hs[`Ch??nh quy???n`]},
                {"??o??n th???" : hs[`??o??n th???`]},
                {"Ki??m nhi???m" : hs[`Ki??m nhi???m`]}
            ];
            hs[`Ch???c v???`] = tmp;
            hs[`db`] = undefined;
            hs[`ct`] = undefined;
            hs[`po`] = undefined;
            hs[`pq`] = undefined;
            hs[`dp`] = undefined;
            hs[`dq`] = undefined;
            hs[`wo`] = undefined;
            hs[`wq`] = undefined;
            hs[`d`]  = undefined;
            hs[`do`]  = undefined;
            hs[`Ki??m nhi???m`] = undefined;   
            hs[`?????ng`] = undefined;
            hs[`Ch??nh quy???n`] = undefined;
            hs[`??o??n th???`] = undefined;
        }
        if (!req.admin)
            rs = rs.filter( r => req.dshosoquanly.includes(r[`id`]));
        res.json(rs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/update', permission.edit, async (req, res, next) => { 
    try {
        console.log("=========================================");
        const hoso = req.body.hoso;
        const lienlac = req.body.lienlac;
        const gianhap = req.body.gianhap; 
        const hanhdong = req.body.hanhdong;
        const userid = req.userid;
        var ans = false;
        if (userid == undefined){
            res.json({"error":"Kh??ng x??c th???c ???????c ID ng?????i d??ng!!!"});
            return;
        }
        if (hanhdong == undefined){
            res.json({"error":"H??nh ?????ng kh??ng h???p l???!!!"});
            return;
        }

        var qq = hoso['Qu?? qu??n'][2]['Ph?????ng/X??'];
        if (qq == '') qq = null;
        var no = hoso['N??i ???'][3]['Ph?????ng/X??'];
        if (no == '') no = null;
        const hs = new utilHoSo(hoso[`id`], hoso['S??? th??? ?????ng'], hoso['H??? v?? t??n ?????m'], hoso['T??n'], hoso['T???t nghi???p'],  qq,
            hoso['Gi???i t??nh'], hoso['T??n gi??o'], hoso['D??n t???c'], hoso['H???c v???n'], hoso['H???c v???'], hoso['Ng??y sinh'],hoso['Ngh??? nghi???p'],
            hoso['N??i ???'][0]['?????a ch???'], no, hoso['S??? l?? l???ch'],  hoso['Ghi ch??'], hoso['M??'], hoso[`Ch???c danh`], hoso[`L?? lu???n ch??nh tr???`],
            hoso[`Chi b???`], hoso[`?????i t?????ng`], 1, hoso[`Tr???ng th??i`]);
        
        var hosoOld = await utilsHoSo.getById(hoso["id"]);
        hosoOld = hosoOld[0][0];

        if (!req.admin){
            if (!req.dshosoquanly.includes(hosoOld.id)){
                res.sendStatus(400);
                return;
            }
            if (hoso[`Chi b???`] != req.chiboquanly){
                res.sendStatus(403);
                return;
            }
        }

        console.log("START HOSO");
        var upHoso = await utilsHoSo.update(userid, hanhdong, hosoOld ,hs); //userid, olddata, newdata
        if (upHoso != -1) ans = true;


        console.log("START CHUCVU");
        var tmp = new hscv(hoso[`id`], hoso[`????n v??? c??ng t??c`], hoso["Ch???c v??? ?????ng"], hoso["Ch???c v??? Ch??nh quy???n"],
                hoso["Ch???c v??? ??o??n th???"], hoso["Ki??m nhi???m"]);
        var oldCV = await utilsHoSo_ChucVu.getChucVuIDHS(hoso[`id`]);
        oldCV = oldCV[0][0];

        var uphscv = await hscv.update(userid, hanhdong, oldCV , tmp);
        if (uphscv != -1) ans = true
        console.log("START GIANHAP");

        ngaybanhanh = gianhap[0]['Ng??y ban h??nh'];
        ngaydubi = gianhap[0]['Ng??y gia nh???p'];
        var oldGNt = await utilsGiaNhap.getById(gianhap[0]['id']);
        oldGNt = oldGNt[0][0];

        if (ngaybanhanh != oldGNt[`Ng??y ban h??nh`])
            await utilsHoSo.updateNgayGiaNhap(hoso['id'], ngaybanhanh, oldGNt[`Ng??y ban h??nh`]);
        
        for (const g of gianhap){
            if (g['Ng??y gia nh???p'] != null && g['Ng??y gia nh???p'] != ''){
                // console.log(g);
                if (g['id'] != undefined){
                    var gn = new utilsGiaNhap(hoso[`id`], g[`Lo???i`], g[`Ng??y gia nh???p`], hoso[`N??i gia nh???p`], g['id']);
                    var oldGN = await utilsGiaNhap.getById(g[`id`]);
                    oldGN = oldGN[0][0];
                    // console.log(GN);

                    var rsGiaNhap = await utilsGiaNhap.update(userid, hanhdong, oldGN, gn);
                    if (rsGiaNhap != -1) ans = true;
                    
                    var sqd = new utilsSoQuyetDinh(g['id'], g['S??? quy???t ?????nh'],g['Ng??y ban h??nh'], null);
                    var oldSQD = await utilsSoQuyetDinh.getById(g[`id`]);
                    oldSQD = oldSQD[0][0];

                    var rssqd = await utilsSoQuyetDinh.update(userid, hanhdong, oldSQD, sqd);
                    if (rssqd != -1) ans = true;
                }
                else{
                    ans = true;
                    var sqd = new utilsSoQuyetDinh(null, g['S??? quy???t ?????nh'], g['Ng??y ban h??nh'], "gia nh???p");
                    var rssqd = await utilsSoQuyetDinh.insert(userid, sqd);
                    var idsqd = rssqd[0][0].result;

                    var gn = new utilsGiaNhap( hoso[`id`], g[`Lo???i`], g[`Ng??y gia nh???p`], hoso[`N??i gia nh???p`], idsqd);
                    var rsGiaNhap = await utilsGiaNhap.insert(userid, g['Ng??y ban h??nh'], gn);
                }
            }
        }
        
        console.log("START lienlac");
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        var ngay = dd + '-' + mm + '-' + yyyy;

        for (const ll of lienlac){
            if (ll['id'] != undefined){
                var cont = new utilsLienLac(ll[`id`], null, null, ll[`?????a ch???`], null);
                var oldLL = await utilsLienLac.getById(ll[`id`]);
                oldLL = oldLL[0][0];
                var upLL = await utilsLienLac.update(userid, hanhdong, oldLL, cont);
                if (upLL != -1) ans = true;
            }else{
                for (const ll of lienlac){
                    if (ll[`?????a ch???`] !== ''){
                        var cont = new utilsLienLac(null, hs[`id`], ll[`Lo???i`], ll[`?????a ch???`], 'ch??nh');
                        // console.log(cont);
                        await utilsLienLac.insert(userid,  ngay, cont);
                    }
                }
                ans=true;
            }
        }
        
        // console.log("DONE");
        if (ans){
            res.statusCode = 200;
            res.statusMessage = 'Update success';
            messenger = "C???p nh???t th??nh c??ng";
        }
        else{
            res.statusCode = 200;
            res.statusMessage = 'NOT Update';
            messenger = "Kh??ng c?? thay ?????i d??? li???u";
        }
        // console.log(messenger);
        res.json({"res":messenger});    
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/insert', permission.create, async (req, res, next) => { 
    try {
        const hoso = req.body.hoso;
        const lienlac = req.body.lienlac;
        const chuyensh = req.body.chuyensh;
        const gianhap = req.body.gianhap;
        var userid = req.userid;


        var qq = hoso['Qu?? qu??n'][2]['Ph?????ng/X??'];
        if (qq == '') qq = null;
        var no = hoso['N??i ???'][3]['Ph?????ng/X??'];
        if (no == '') no = null;
    
        var ngay;
        if (chuyensh == null || chuyensh == undefined){
            ngay = gianhap[0][`Ng??y ban h??nh`];
            flag = false;
        }else{
            ngay = chuyensh[`Ng??y ban h??nh`];
            flag = true;
        }
    
        console.log("START Hoso ?");
        if(hoso['T???t nghi???p'] == '')
            hoso['T???t nghi???p'] = 'Kh??c';
        // var chibo = hoso['Chi b???'];
        const hs = new utilHoSo(null, hoso['S??? th??? ?????ng'], hoso['H??? v?? t??n ?????m'], hoso['T??n'], hoso['T???t nghi???p'],  qq,
        hoso['Gi???i t??nh'], hoso['T??n gi??o'], hoso['D??n t???c'], hoso['H???c v???n'], hoso['H???c v???'], hoso['Ng??y sinh'],hoso['Ngh??? nghi???p'],
        hoso['N??i ???'][0]['?????a ch???'], no, hoso['S??? l?? l???ch'],  hoso['Ghi ch??'], hoso['M??'], hoso[`Ch???c danh`], hoso[`L?? lu???n ch??nh tr???`],
        hoso[`Chi b???`], hoso[`?????i t?????ng`], 1, hoso[`Tr???ng th??i`]);
        // console.log(hs);

        console.log(req.chiboquanly, hoso[`Chi b???`]);
        if (!req.admin)
            if (hoso[`Chi b???`] != req.chiboquanly){
                res.sendStatus(403);
                return;
            }

        var ans = await utilsHoSo.insert(userid,  ngay, hs);
        var hosoID = ans[0][0].result;
        var charid = share.encode(hosoID.toString());

        try {
            fs.mkdirSync(path.join('Storage', charid)); 
            fs.mkdirSync(path.join('Storage', charid, "H??? s?? k???t n???p")); 
            fs.mkdirSync(path.join('Storage', charid, "C??ng nh???n ch??nh th???c")); 
            fs.mkdirSync(path.join('Storage', charid, "????nh gi?? ?????ng vi??n")); 
            fs.mkdirSync(path.join('Storage', charid, "C???p nh???t th??ng tin h???ng n??m")); 
            fs.mkdirSync(path.join('Storage', charid, "Kh??c")); 
        } catch (error) {
            console.log(error);
            res.sendStatus(400);
            return;
        }

        console.log("START Chucvu");
        var tmp = new hscv(hosoID, hoso[`????n v??? c??ng t??c`], hoso["Ch???c v??? ?????ng"], hoso["Ch???c v??? Ch??nh quy???n"], hoso["Ch???c v??? ??o??n th???"], hoso[`Ki??m nhi???m`]);
        await hscv.insert(userid,  ngay, tmp);

        console.log("START GIANHAP");
        for (const g of gianhap){
            if(g[`Ng??y gia nh???p`] != '' && g[`Ng??y gia nh???p`] != null && g[`Ng??y gia nh???p`] != undefined ){
                if (g['Ng??y ban h??nh'] == '') g['Ng??y ban h??nh'] = null;
                if (g['S??? quy???t ?????nh'] == '') g['S??? quy???t ?????nh'] = null;
                var sqd = new utilsSoQuyetDinh(null, g['S??? quy???t ?????nh'],g['Ng??y ban h??nh'], "gia nh???p");
                // console.log(g, sqd);

                var rssqd = await utilsSoQuyetDinh.insert(userid,  sqd);
                var idsqd = rssqd[0][0].result;

                var gn = new utilsGiaNhap(hosoID, g[`Lo???i`], g[`Ng??y gia nh???p`], hoso['N??i gia nh???p'], idsqd);
                await utilsGiaNhap.insert(userid,  g[`Ng??y ban h??nh`], gn)
                
            }
        }

        console.log("START ChuyenSH");
        if (chuyensh !== undefined){
            var s = new utilsSoQuyetDinh(null, chuyensh[`S??? quy???t ?????nh`], chuyensh[`Ng??y ban h??nh`], "Chuy???n sh");
            var rssqd = await utilsSoQuyetDinh.insert(userid,  s);
            var idsqd = rssqd[0][0].result;
    
            var chuyenden = chuyensh[`Chuy???n ?????n`];
            var c = new utilsChuyenSH(null, hosoID, idsqd, chuyensh[`Ng??y ??i`], 
                        'Chuy???n ?????n', chuyensh[`Chuy???n t???`], chuyenden);
                    
            await utilsChuyenSH.insert(userid,  ngay, c);
            
        }
        // console.log(huyhieu[0]);
    
        console.log("START lienlac");
        for (const ll of lienlac){
            if (ll[`?????a ch???`] !== ''){
                var cont = new utilsLienLac(null, hosoID, ll[`Lo???i`], ll[`?????a ch???`], 'ch??nh');
                // console.log(cont);
                await utilsLienLac.insert(userid,  ngay, cont);
            }
        }
        res.json({
            "res":"Th??m th??nh c??ng",
            "hosoid":hosoID
        });
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/id/:id', async (req,res, next) => {
    try {
        let hs = await utilsHoSo.getById(parseInt(req.params.id));
        hs = await share.decodeArray(hs[0]);
        hs = hs[0];
        // console.log(hs);
        if (hs.length == 0) {
            res.json({"error":"Kh??ng t???n t???i h??? s?? t????ng ???ng"});
            return;
        }
        if (!req.admin)
        if (!req.dshosoquanly.includes(hs[`id`])){
            res.sendStatus(403);
            return;
        }
        var cv = await utilsHoSo_ChucVu.getChucVuIDHS(parseInt(req.params.id));
        cv = await share.decodeArray(cv[0]);
        var ngn = await utilsGiaNhap.getNoiGiaNhap(parseInt(req.params.id));
        if (hs[`T??n gi??o`] == null) hs[`T??n gi??o`] = 1;
        if (hs[`D??n t???c`] == null) hs[`D??n t???c`] = 1;
        
        if (ngn[0].length == 0)
            hs['N??i gia nh???p'] = null;
        else
            hs['N??i gia nh???p'] = await share.decode(ngn[0][0].noi);
        
        
        if (hs[`Qu?? qu??n`] == null){
            var tmp1 =[
                {"T???nh/Th??nh" : 1},
                {"Qu???n/Huy???n" : 1},
                {"Ph?????ng/X??"  : 1}
            ]
            hs[`Qu?? qu??n`] = tmp1;
        }
        else{
            var location = await utilsLocation.getEachinfo(hs[`Qu?? qu??n`]);
            location  = location[0][0]; 
            var tmp1 =[
                {"T???nh/Th??nh" : location.idp},
                {"Qu???n/Huy???n" : location.idd},
                {"Ph?????ng/X??"  : location.idw}
            ]
            hs[`Qu?? qu??n`] = tmp1;
        }
        if (hs[`N??i ???`] == null){
            var tmp1 =[
                {"?????a ch???"    : ''},
                {"T???nh/Th??nh" : 1},
                {"Qu???n/Huy???n" : 1},
                {"Ph?????ng/X??"  : 1}
            ]
            hs[`N??i ???`] = tmp1;
        }
        else{
            var location2 = await utilsLocation.getEachinfo(hs[`N??i ???`]);
            location2  = location2[0][0]; 
            var tmp =[
                {"?????a ch???"    : hs.d},
                {"T???nh/Th??nh" : location2.idp},
                {"Qu???n/Huy???n" : location2.idd},
                {"Ph?????ng/X??"  : location2.idw}
            ]
            hs[`N??i ???`] = tmp;
        }
        // console.log(cv);
        if(cv.length == 0){
            hs["????n v??? c??ng t??c"]  = 1;
            hs["Ch???c v??? ?????ng"] = 1;
            hs["Ch???c v??? Ch??nh quy???n"] =  1;
            hs["Ch???c v??? ??o??n th???"] = 1;
            hs["Ki??m nhi???m"] = '';
        }
        else{
            cv = cv[0];
            hs["????n v??? c??ng t??c"]  = cv[`????n v??? c??ng t??c`];
            hs["Ch???c v??? ?????ng"] = cv[`Ch???c v??? ?????ng`];
            hs["Ch???c v??? Ch??nh quy???n"] = cv[`Ch???c v??? Ch??nh quy???n`];
            hs["Ch???c v??? ??o??n th???"] = cv[`Ch???c v??? ??o??n th???`];
            hs["Ki??m nhi???m"] = cv[`Ki??m nhi???m`]
        }
        hs["d"] = undefined;
        res.json(hs);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.get('/name/:name' ,async (req,res, next) => {
    try {
        let rs = await utilsHoSo.getByName(req.params.name);
        rs = rs[0];
        for (const hs of rs){
            var chucvu = await utilschucvu.getByIdHS(hs["id"]);
            chucvu = chucvu[0];
            var name = [];
            for (const cv of chucvu){
                name.push(cv['id ch???c v???'])
            }
            hs["Ch???c v???"] = name;
            hs[`d`] = undefined;
        }
        res.json(rs[0]);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/deActive', permission.delete, async (req, res, next) =>{ // set active = 0
    try {
        var hoso = req.body.hoso;
        const userid = req.userid;
        if (!req.admin)
            for (const h of hoso){
                if (!req.dshosoquanly.includes(parseInt(h))){
                    res.messenger("Kh??ng c?? quy???n x??a h??? s?? ngo??i ph???m vi chi b??? cho ph??p");
                    res.sendStatus(403);
                    return;
                }
            }
        let rs = await utilsHoSo.active(userid, hoso, 0);
        var mes;
        if (rs.length == 0)
            mes = {
                "res":"X??a th??nh c??ng"
            }
        else
            mes = {
                "error":"X??a th???t b???i",
                "list":rs
            }
        res.json(mes);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.put('/active', permission.delete, async (req, res, next) =>{ // set active = 1
    try {
        var hoso = req.body.hoso;
        if (!req.admin)
            for (const h of hoso){
                if (!req.dshosoquanly.includes(parseInt(h))){
                    res.messenger("Kh??ng c?? quy???n x??a h??? s?? ngo??i ph???m vi chi b??? cho ph??p");
                    res.sendStatus(403);
                    return;
                }
            }
        let rs = await utilsHoSo.active(userid, hoso, 1);
        var mes;
        if (rs.length == 0)
            mes = {
                "res":"Active th??nh c??ng"
            }
        else
            mes = {
                "error":"Active th???t b???i",
                "list":rs
            }
        res.json(mes);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }

})

// router.delete('/delete/:id', permission.delete, async (req, res, next) =>{ // delete from db
//     try {
//         var ids = req.params.id.split(',');
//         let rs = await utilsHoSo.active(req.userid, ids, 0);
//         res.json(rs[0]);
//     } catch (err) {
//         await share.errorMailer(req, res, next, err.stack.toString());
//         console.log(err);
//         res.json(err);
//     }
// })

//import excel 
var xlsx = require('xlsx');
router.post('/import' , async (req, res, next) => {
    try {
        var hoso = req.body.hoso;
        var userid = req.userid;
        userid = 1;
        
        hoso.shift();
        for (const hs of hoso){
            if (hs[0]==undefined)
                break;
            if (hs[10])
                var ngay = hs[10].split("/").join("-");
            else
                var ngay = hs[7].split("/").join("-");
            
            var gioitinh, ngaysinh, chibo;
            if (hs[3] !== null){
                gioitinh = "Nam";
                ngaysinh = hs[3];
            }
            else{
                gioitinh = "N???";
                ngaysinh = hs[4];
            }
            chibo = await utilsChiBo.getByName(hs[16]);
            chibo = chibo[0]
            if (chibo.length > 0){
                chibo = chibo[0][`id`] ;
                if (!req.admin)
                    if (chibo != req.chiboquanly){
                        res.sendStatus(403);
                        return;
                    }
            }
            var ghichu = null;
            if (hs[17] !== undefined ){
                ghichu = hs[17];
            }
            var diachi = null;
            ngaysinh = ngaysinh.split("/").join("-");
    
            var chucdanh =  hs[14];
            var llct =  hs[15];
            var addhoso = new utilsHoSo(null, hs[6], hs[1], hs[2],null, null, gioitinh, null, 
                null, hs[13], hs[12], ngaysinh, hs[9], null, null, hs[5], ghichu, null, null, null,chibo, hs[18], 1,  1);
            
            var add = await utilsHoSo.insert(userid, ngay, addhoso);
            var hosoID = add[0][0].result;
            
            var charid = share.encode(hosoID.toString());

            try {
                fs.mkdirSync(path.join('Storage', charid)); 
                fs.mkdirSync(path.join('Storage', charid, "H??? s?? k???t n???p")); 
                fs.mkdirSync(path.join('Storage', charid, "C??ng nh???n ch??nh th???c")); 
                fs.mkdirSync(path.join('Storage', charid, "????nh gi?? ?????ng vi??n")); 
                fs.mkdirSync(path.join('Storage', charid, "C???p nh???t th??ng tin h???ng n??m")); 
                fs.mkdirSync(path.join('Storage', charid, "Kh??c")); 
            } catch (error) {
                console.log(error);
                res.json({"res":"Tr??ng s??? th??? ?????ng"});
                return;
            }

            var hscv = new utilsHoSo_ChucVu(hosoID, null, null, null, null, null);
            await utilsHoSo_ChucVu.insert(userid, ngay, hscv);
            
            var cont = new utilsLienLac(null, hosoID, "email", null, 'ch??nh');
            await utilsLienLac.insert(userid, ngay, cont);
            var cont = new utilsLienLac(null, hosoID, "sdt", null, 'ch??nh');
            await utilsLienLac.insert(userid, ngay, cont);


            if(hs[7] != null){
                var ngaygianhap = hs[7].split("/").join("-");
                var sqd = new utilsSoQuyetDinh(null, null, ngaygianhap , "gia nh???p");
                var rssqd = await utilsSoQuyetDinh.insert(userid, sqd);
                var idsqd = rssqd[0][0].result;
    
                var gndb = new utilsGiaNhap( hosoID, "D??? b???", ngaygianhap, null,idsqd );
                var rsGiaNhapdb = await utilsGiaNhap.insert(userid, ngay, gndb)
            }

            if(hs[8] != null){
                var ngaygianhapct = hs[8].split("/").join("-");
                var sqdct = new utilsSoQuyetDinh(null, null, ngaygianhapct , "gia nh???p");
                var rssqdct = await utilsSoQuyetDinh.insert(userid, sqdct);
                var idsqd = rssqdct[0][0].result;
    
                var gnct = new utilsGiaNhap( hosoID, "Ch??nh th???c", ngaygianhapct, null, idsqd);
                var rsGiaNhapct = await utilsGiaNhap.insert(userid, ngay, gnct)
            }
            
            var loaichuyen, chuyenden;
            
            if (hs[11] != null){
                var tmp = await utilsChiBo.getByName(hs[16]);
                tmp = tmp[0];
                if (tmp.length > 0){
                    loaichuyen = "Ch??nh th???c, trong n?????c";
                    chuyenden = hs[11] + " " + hs[16] ;
                }else{
                    loaichuyen = "Ch??nh th???c, trong n?????c";
                    chuyenden = hs[11] + " " + hs[16] ;
                }
                if (hs[10] != null){
                    var ngaychuyen = hs[10].split("/").join("-");
                    var sqd = new utilsSoQuyetDinh(null, null, ngaychuyen , "chuy???n sh");
                    var rssqd = await utilsSoQuyetDinh.insert(userid, sqd);
                    var idsqd = rssqd[0][0].result;
                    
                    var c = new utilsChuyenSH(null, hosoID, idsqd, ngaychuyen,
                        loaichuyen, null, chuyenden);
                    var rsChuyenSH = await utilsChuyenSH.insert(userid, ngay, c);
                }
            }
        }
        res.json({"res": "Th??nh c??ng"});
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

//LOG
router.get('/log/llct/:id', async (req, res, next) => {
    try {
        if (req.admin || req.dshosoquanly.includes(parseInt(req.params.id))){
            var rs = await utilsLog.getLog('hoso','L?? lu???n ch??nh tr???',parseInt(req.params.id));
            rs = await share.decodeArray(rs[0]);
            res.json(rs);
        }
        else{
            res.sendStatus(403);
        }
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/log/chucDanh/:id', async (req, res, next) => {
    try {
        if (req.admin || req.dshosoquanly.includes(parseInt(req.params.id))){
            var rs = await utilsLog.getLog('hoso','Ch???c danh',parseInt(req.params.id));
            rs = await share.decodeArray(rs[0]);
            res.json(rs);
        }
        else{
            res.sendStatus(403);
        }
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/log/doiTuong/:id', async (req, res, next) => {
    try {
        if (req.admin || req.dshosoquanly.includes(parseInt(req.params.id))){
            var rs = await utilsLog.getLog('hoso','?????i t?????ng',parseInt(req.params.id));
            rs = await share.decodeArray(rs[0]);
            res.json(rs);
        }
        else{
            res.sendStatus(403);
        }
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.get('/log/sinhHoat/:id', async (req, res, next) => {
    try {
        if (req.admin || req.dshosoquanly.includes(parseInt(req.params.id))){
            var rs = await utilsLog.getLog('hoso','Chi b???',parseInt(req.params.id));
            rs = await share.decodeArray(rs[0]);
            res.json(rs);
        }
        else{
            res.sendStatus(403);
        }
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

//FILE uploader
const multer = require('multer');
const { compile } = require('morgan');

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'upload/')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`)
    }
  })
  
const upload = multer({ storage: storage });


router.post('/uploader/multifile', upload.array('files'), async (req, res, next) => {
    // res.send("test");
    try {
      const files = req.files;
    //   console.log(files);
      var folder = req.body.folder;
      var name = req.body.name;
      var idhs = await utilsHoSo.getBySTD(name);
      idhs = idhs[0][0].id;
      console.log(req.body);
      if (!req.admin && !req.dshosoquanly.includes(idhs)){
          res.sendStatus(403);
          return;
      }
      name = share.encode(idhs.toString());
      // console.log(files);
      if (!files) {
        const error = new Error('No File');
        error.httpStatusCode = 400;
        return next(error);
      }
      var loi ="";
      for (const file of files){
        var extra = path.extname(file.originalname);
        var savelocation = path.join('Storage', name, folder, file.originalname);
        if (fs.existsSync(savelocation))
          loi += "Tr??ng t??n file t???i th?? m???c: "+ folder + " t??n file: " + file.originalname + "; ";
        else
          fs.rename('upload/' + file.originalname, savelocation, function (err) {
              if (err) {
                  return console.error(err);
              }
          });
      }
      if (loi != ""){
        res.json({"error":loi});
      }
      else
        res.send({"res": "success"});
    } catch (err) {
      await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/uploader/singleFile', upload.single('file'), async (req, res, next) => {
    try {
      const file = req.file;
      // console.log(file);
      var name = req.body.name;
      var folder = req.body.folder;
      // console.log(name);
        var idhs = await utilsHoSo.getBySTD(name);
        idhs = idhs[0][0].id;
        
        if (!req.admin && !req.dshosoquanly.includes(idhs)){
            res.sendStatus(403);
            return;
        }

        name = share.encode(idhs.toString());
      // console.log(file);
      if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400
        return next(error);
      }
      var savelocation = path.join('Storage', name, folder, file.originalname);
      fs.rename('upload/' + file.originalname, savelocation, function (err) {
        if (err) {
            return console.error(err);
        }
        res.json({"res": "Th??nh c??ng"});
      });
    } catch (err) {
      await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/uploader/singleImage', upload.single('file'), async (req, res, next) => {
    try {
      const file = req.file;
      var name = req.body.name;
      
      var idhs = await utilsHoSo.getBySTD(name);
      idhs = idhs[0][0].id;
      
      if (!req.admin && !req.dshosoquanly.includes(idhs)){
        res.sendStatus(403);
        return;
      }
      name = share.encode(idhs.toString());
      // console.log(file);
      if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400
        res.send(error);
      }
        var extra = path.extname(file.originalname);
        var savelocation = path.join('Storage', name,'images.jpg');
            fs.rename('upload/' + file.originalname, savelocation, function (err) {
              if (err) {
                  return console.error(err);
              }
              res.send(file);
            });
          // })
    } catch (err) {
      await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.delete('/uploader/delete/:name/:folder/:file',async (req, res, next) => {
    try {
      var name = req.params.name;
      var folder = req.params.folder;
      var file = req.params.file;
      var idhs = await utilsHoSo.getBySTD(name);
      idhs = idhs[0][0].id;
      
      if (!req.admin && !req.dshosoquanly.includes(idhs)){
        res.sendStatus(403);
        return;
      }

      name = share.encode(idhs.toString());
      var location =path.join('Storage', name, folder, file);
      fs.unlinkSync(location);
      res.send({"res": "success"})
    } catch (err) {
      await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

//FILE downloader
router.get('/downloader/avatar/:name', async (req, res, next) => {
    try {
        var name = req.params.name;
        var idhs = await utilsHoSo.getBySTD(name);
        if (idhs[0].length != 0)
            idhs = idhs[0][0].id;
        else 
            throw new Error("kh??ng t???n t???i s??? th??? ?????ng");
            
        if (!req.admin && !req.dshosoquanly.includes(idhs)){
            res.sendStatus(403);
            return;
        }
        name = share.encode(idhs.toString());
        var location = path.join(__dirname,'../Storage', name,'images.jpg');
        // console.log(location);
        fs.exists(location,async (e) =>{
            if (e){
                res.sendFile(location);
            }else
                res.send(null);
        });
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.post('/downloader/filename', async (req, res, next) => {
    try {
        var name = req.body.name;
        var idhs = await utilsHoSo.getBySTD(name);
        idhs = idhs[0][0].id;
        console.log(idhs, req.dshosoquanly)
        if (!req.admin && !req.dshosoquanly.includes(idhs)){
            res.sendStatus(403);
            return;
        }
        name = share.encode(idhs.toString());
        console.log(idhs)
        var Root = path.join('Storage', name)
        var filename =[];
        fs.readdir(Root, (err, folders) => {
            if (err){ 
                res.json({"res":"No folder"});
                return;
            }
            if (folders != undefined)
                for (const folder of folders){
                    var tmppath = path.join(Root, folder);
                    // console.log(folder);
                    var stat = fs.statSync(tmppath);
                    if (stat.isDirectory()){
                        var tmp ={};
                        tmp['folder'] = folder;
                        tmp['files'] = [];
                        var files = fs.readdirSync(tmppath)
                        for (const file of files){
                            tmp['files'].push({"name" : file});
                        }
                        // console.log(tmp['files']);
                        filename.push(tmp);
                    }
                }
                // console.log(filename);
                res.json(filename);
            });
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});

router.post('/downloader/readFilePdf' , async (req, res, next) => {
    try {
        var name = req.body.name;
        var idhs = await utilsHoSo.getBySTD(name);
        idhs = idhs[0][0].id;

        if (!req.admin && !req.dshosoquanly.includes(idhs)){
            res.sendStatus(403);
            return;
        }

        name = share.encode(idhs.toString());
        var folder = req.body.folder;
        const filename = req.body.filename;
        var location = path.join(__dirname,'../Storage', name, folder, filename);
        res.sendFile(location);
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});


function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function createGiaNhap(id, yyyy){
    var so = 'SQD' + getRndInteger(10,99) +'/'+ getRndInteger(100,999) ;
    var x = getRndInteger(20,30);
    while (yyyy+x > 2019)
        x = getRndInteger(20,30);
    var d = getRndInteger(1 ,28);
    var m = getRndInteger(1 ,12);
    var ngaybanhanh = d + '-' + m + '-' + (yyyy + x);

    var sqd = new utilsSoQuyetDinh(null, so, ngaybanhanh, "gia nh???p");
    var rssqd = await utilsSoQuyetDinh.insert(sqd);
    var idsqd =  rssqd[0].insertId;
    // console.log(sqd);
    var tmp =['H??? ch?? Minh', 'H?? N???i', 'Qu???ng Ng??i', 'C???n Th??', 'H???i Ph??ng', '???? N???ng'];
    var ngn = tmp[getRndInteger(0,5)]
    var gn = new utilsGiaNhap( id, 'D??? b???', ngaybanhanh, ngn, idsqd);
    // console.log(gn);
    var rsGiaNhap = await utilsGiaNhap.insert(gn);

    if (yyyy + x + 1 < 2021){
        ngaybanhanh = d + '-' + m + '-' + (yyyy + x + 1);
        so = 'SQD' + getRndInteger(10,99) +'/'+ getRndInteger(100,999) ;

        sqd = new utilsSoQuyetDinh(null, so, ngaybanhanh, "gia nh???p");
        rssqd = await utilsSoQuyetDinh.insert(sqd);
        idsqd =  rssqd[0].insertId;
        gn = new utilsGiaNhap( id, 'Ch??nh th???c', ngaybanhanh, ngn, idsqd);
        // console.log(gn);
        rsGiaNhap = await utilsGiaNhap.insert(gn);
    }
    return ngaybanhanh = d + '-' + m + '-' + (yyyy + x);
}

async function createLienLac(hosoID,loai){
    var diachi = '0' + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10);
    var cont = new utilsLienLac(null, hosoID, loai, diachi, 'Ch??nh');
    var rsLienLac = await utilsLienLac.insert(cont);
}

module.exports = router;