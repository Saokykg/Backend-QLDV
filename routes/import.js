var express = require('express');
const utils = require('../middleware/utils');
const utilsHoso = require('../Utils/utilsHoso');
const utilsChuyenSH = require('../Utils/utilsChuyenSH');
const utilsGiaNhap = require('../Utils/utilsGiaNhap');
const utilsChiBo = require('../Utils/utilsChiBo');
const utilsHoso_HuyHieu = require('../Utils/utilsHoso_HuyHieu');
const utilsHoso_ChucVu = require('../Utils/utilsHoso_ChucVu');
const utilsNgoaiQuoc = require('../Utils/utilsNgoaiQuoc');
const utilsSoQuyetDinh = require('../Utils/utilsSoQuyetDinh');
const utilsThanhTich = require('../Utils/utilsThanhTich');
const utilsQuyHoach = require('../Utils/utilsQuyHoach');
const utilsHoso_QuyHoach = require('../Utils/utilsHoso_QuyHoach');
const utilsDanhGia = require('../Utils/utilsdanhgia');
const utilsMienSh = require('../Utils/utilsMienSinhHoat');
const utilsthongbao = require('../Utils/utilsThongBao');
const share = require('../share');
const utilsLog = require('../Utils/utilsLog');
const fs = require('fs');
const path = require('path');
var router = express.Router();

var xlsx = require('xlsx');
const permission = require('../middleware/permission');
const utilsLienLac = require('../utils/utilsLienLac');
// var utilsHuyHieu = require('../Utils/utilsHuyHieu');

router.post('/hoso' , async (req, res, next) => {
    try {
        var hoso = req.body.hoso;
        var userid = req.body.userid;
        userid = 1;
        
        hoso.shift();
        for (const hs of hoso){
            var ngay = hs[7].split("/").join("-");
            var gioitinh, ngaysinh, chibo;
            if (hs[3] !== null){
                gioitinh = "Nam";
                ngaysinh = hs[3];
            }
            else{
                gioitinh = "Nữ";
                ngaysinh = hs[4];
            }
            chibo = await utilsChiBo.getByName(hs[16]);
            chibo = chibo[0];
            if (chibo.length > 0){
                chibo = chibo[0][`id`] ;
            }
            var ghichu = null;
            if (hs[17] !== undefined ){
                ghichu = hs[17];
            }
            var diachi = null;
            ngaysinh = ngaysinh.split("/").join("-");
    
            var chucdanh =  hs[14];
            var llct =  hs[15];
            var addhoso = new utilsHoso(null, hs[6], hs[1], hs[2],null, null, gioitinh, null, 
                null, hs[13], hs[12], ngaysinh, hs[9], null, null, hs[5], ghichu, null, null, null,chibo, hs[18], 1,  1);
            
                // console.log(addhoso, ngay);
            var add = await utilsHoso.insert(userid, ngay, addhoso);
            
            // try {
            //     fs.mkdirSync(path.join('Storage', addhoso.soThe)); 
            //     fs.mkdirSync(path.join('Storage', addhoso.soThe, "Hồ sơ kết nạp")); 
            //     fs.mkdirSync(path.join('Storage', addhoso.soThe, "Công nhận chính thức")); 
            //     fs.mkdirSync(path.join('Storage', addhoso.soThe, "Đánh giá Đảng viên")); 
            //     fs.mkdirSync(path.join('Storage', addhoso.soThe, "Cập nhật thông tin hằng năm")); 
            //     fs.mkdirSync(path.join('Storage', addhoso.soThe, "Khác")); 
            // } catch (error) {
            //     console.log(error);
            //     res.json({"res":"Trùng số thẻ Đảng"});
            //     return;
            // }

            var hosoID = add[0][0].result;
            var hscv = new utilsHoso_ChucVu(hosoID, null, null, null, null, null);
            await utilsHoso_ChucVu.insert(userid, ngay, hscv);
            
            var cont = new utilsLienLac(null, hosoID, "email", null, 'chính');
            await utilsLienLac.insert(userid, ngay, cont);
            var cont = new utilsLienLac(null, hosoID, "sdt", null, 'chính');
            await utilsLienLac.insert(userid, ngay, cont);


            if(hs[7] != null){
                var ngaygianhap = hs[7].split("/").join("-");
                var sqd = new utilsSoQuyetDinh(null, null, ngaygianhap , "gia nhập");
                var rssqd = await utilsSoQuyetDinh.insert(userid, sqd);
                var idsqd = rssqd[0][0].result;
    
                var gndb = new utilsGiaNhap( hosoID, "Dự bị", ngaygianhap, null,idsqd );
                var rsGiaNhapdb = await utilsGiaNhap.insert(userid, ngay, gndb)
            }

            if(hs[7] != null){
                var ngaygianhapct = hs[7].split("/").join("-");
                var sqdct = new utilsSoQuyetDinh(null, null, ngaygianhapct , "gia nhập");
                var rssqdct = await utilsSoQuyetDinh.insert(userid, sqdct);
                var idsqd = rssqdct[0][0].result;
    
                var gnct = new utilsGiaNhap( hosoID, "Chính thức", ngaygianhapct, null, idsqd);
                var rsGiaNhapct = await utilsGiaNhap.insert(userid, ngay, gnct)
            }
            
            var loaichuyen, chuyenden;
            
            if (hs[11] != null){
                var tmp = await utilsChiBo.getByName(hs[16]);
                tmp = tmp[0];
                if (tmp.length > 0){
                    loaichuyen = "Chính thức, trong nước";
                    chuyenden = hs[11] + " " + hs[16] ;
                }else{
                    loaichuyen = "Chính thức, trong nước";
                    chuyenden = hs[11] + " " + hs[16] ;
                }
                if (hs[10] != null){
                    var ngaychuyen = hs[10].split("/").join("-");
                    var sqd = new utilsSoQuyetDinh(null, null, ngaychuyen , "chuyển sh");
                    var rssqd = await utilsSoQuyetDinh.insert(userid, sqd);
                    var idsqd = rssqd[0][0].result;
                    
                    var c = new utilsChuyenSH(hosoID, idsqd, ngaychuyen,
                        loaichuyen, null, chuyenden);
                    // console.log(c);
                    var rsChuyenSH = await utilsChuyenSH.insert(userid, ngay, c);
                }
            }
        }
        res.json({"res": "Thành công"});
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

//middleware for checking access token
// router.use(utils.authenticateToken);














module.exports = router;