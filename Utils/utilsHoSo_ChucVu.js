var mysql = require('mysql');
var db = require('./connection');
const share = require('../share')

module.exports = class utilsHoSo_ChucVu{
    constructor(idhs, donvi, dang, chinhquyen, doanthe, kiemnhiem){
        this.idhs = idhs;
        this.donvi = donvi;
        this.dang = dang;
        this.chinhquyen = chinhquyen;
        this.doanthe = doanthe;
        this.kiemnhiem = share.encode(kiemnhiem);
    }

    static getChucVu(){
        var sql = "SELECT hscv.`idhs` as `id hồ sơ`, dv.`Tên` as `Đơn vị công tác`,  cv1.`Tên` as `Chức vụ Đảng`, cv2.`Tên` as `Chức vụ Chính quyền` , cv3.`Tên`  as`Chức vụ Đoàn thể` " +
         " FROM hoso_chucvu AS hscv " + 
         "  JOIN chucvu AS cv1 ON hscv.`Đảng` = cv1.`id` " +
         "  JOIN chucvu AS cv2 ON hscv.`Chính quyền` = cv2.`id` " +
         "  JOIN chucvu AS cv3 ON hscv.`Đoàn thể` = cv3.`id` " +
         "  JOIN donvi  as dv  ON hscv.`id đơn vị`  = dv.`id` order by hscv.`idhs` ";
        return db.execute(sql);
    }
    static getChucVupure(){
        var sql = "select *, idhs as `id hồ sơ` from hoso_chucvu order by `idhs ";
        return db.execute(sql);
    }
    static getChucVuIDHS(idhs){
        var sql = "SELECT hscv.`idhs` as `id hồ sơ`, dv.`id` as `Đơn vị công tác`,  cv1.`id` as `Chức vụ Đảng`, cv2.`id` as `Chức vụ Chính quyền` , cv3.`id`  as`Chức vụ Đoàn thể`, coalesce(hscv.`Kiêm nhiệm`, '') as `Kiêm nhiệm` " +
         " FROM hoso_chucvu AS hscv " + 
         "  LEFT JOIN chucvu AS cv1 ON hscv.`Đảng` = cv1.`id` " +
         "  LEFT JOIN chucvu AS cv2 ON hscv.`Chính quyền` = cv2.`id` " +
         "  LEFT JOIN chucvu AS cv3 ON hscv.`Đoàn thể` = cv3.`id` " +
         "  LEFT JOIN donvi  as dv  ON hscv.`id đơn vị`  = dv.`id` where  hscv.`idhs`= ? ";
        return db.execute(sql,[idhs]);
    }
    
    static insert(userId, ngay, info){
        var sql = "SELECT InsertHoSo_ChucVu(?,?,?,?,?,?,?,?) as result";
        var inserts = [];
        inserts.push(userId);
        inserts.push(ngay);
        inserts.push(info.idhs);
        inserts.push(info.donvi);
        inserts.push(info.dang);
        inserts.push(info.chinhquyen);
        inserts.push(info.doanthe);
        inserts.push(info.kiemnhiem);
        // console.log(mysql.format(sql,inserts));
        return db.execute(sql,inserts);
    }

    static async update(userid, hanhdong, oldinfo, info){
        var sql = "select updateHoSo_ChucVu(?,?,?,?,?,?,?,?) as result ";
        var check = 0;
        check = await findDifferent(oldinfo, info);
        if (check == 5) return -1;
        var inserts = [userid, hanhdong, info.idhs, info.donvi, info.dang, info.chinhquyen, info.doanthe, info.kiemnhiem];
        // console.log(mysql.format(sql, inserts));
        return db.execute(sql, inserts);
    }
    static delete(idhs, loai){
        var sql = "DELETE FROM `hoso_chucvu` WHERE (`idhs` = ?) and (`Loại` = ?)";
        return db.execute(sql,[idhs,loai]);
    }
    static deleteByidCV(idcv){
        var sql = "DELETE FROM `hoso_chucvu` WHERE (`id chức vụ` = ?)";
        return db.execute(sql,[idcv]);
    }
}

async function findDifferent(oldinfo, info){
    var check = 0;
    if (oldinfo[`Đơn vị công tác`]    == info.donvi)     {check++; info.donvi = null;}
    if (oldinfo[`Chức vụ Đoàn thể`]   == info.doanthe)   {check++; info.doanthe = null;}
    if (oldinfo[`Chức vụ Đảng`]       == info.dang)      {check++; info.dang = null;}
    if (oldinfo[`Chức vụ Chính quyền`]== info.chinhquyen){check++; info.chinhquyen = null;}
    if (oldinfo[`Kiêm nhiệm`]         == info.kiemnhiem ) {check++; info.kiemnhiem = null;}

    return check;
}