require('dotenv').config();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const share = require('./share');
const utilsHoSo = require('./Utils/utilsHoSo');
const utilsthongbao = require('./Utils/utilsThongBao');
const utilsTonGiao = require('./Utils/utilsTonGiao');

// console.log(iv);
module.exports = class Thongbao{

    static async gianhapdang(hoTen, ten, std, idhoso, gianhapdubi){
        await utilsthongbao.deleteType(idhoso, "gianhapdang");
        var ngaytao = today();
        var nd = hoTen + " " + ten + " - " + std + ": hạn kết nạp chính thức" ;
        var thongbao = new utilsthongbao(null, ngaytao, nd, gianhapdubi, "gianhapdang", idhoso, "hoSo");
        await utilsthongbao.insertGiaNhap(thongbao);
    }

    static async huyhieu(hoTen, ten, std, idhoso, ngaygianhap){
        await utilsthongbao.deleteType(idhoso, "huyhieu");
        var ngaytao = today();
        var nd = hoTen + " " + ten + " - " + std + ": ";
        var thongbao = new utilsthongbao(null, ngaytao, nd, ngaygianhap, "huyHieu", idhoso, "huyHieu");
        await utilsthongbao.insertHuyhieu(thongbao);
    }

}

function today(){
    var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        var now = yyyy + '-' + mm + '-' + dd;
    return now;
}