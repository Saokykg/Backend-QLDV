const db = require('./connection');
const { selecthoso } = require('./utilsLoc');
const share = require('../share');
var sqlkyluat = "SELECT k.`id` as `id` , hs.`Số thẻ đảng`, `Số lý lịch`, hs.`Họ và tên đệm`, hs.`Tên`,  DATE_FORMAT(`Ngày sinh`,'%d-%m-%Y') as `Ngày sinh`, `Giới tính`,  "+
                " sqd.`Số quyết định`, DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, `Hình thức kỷ luật`, k.`Nội dung`, DATE_FORMAT(`Ngày`,'%d-%m-%Y') as `Ngày`, k.`Ghi chú` "+
                "from kyluat k, hoso hs, soquyetdinh sqd  "+
                "where hs.`id` = k.`idhs` and k.`Số quyết định` = sqd.`id` ";
var sqlkyluatpure = "SELECT k.`id` as `id`, `idhs` as `id hồ sơ` , sqd.`id` as `id số quyết định`, sqd.`Số quyết định`, "+ 
                "  DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, `Hình thức kỷ luật`, k.`Nội dung`, "+ 
                "  DATE_FORMAT(`Ngày`,'%d-%m-%Y') as `Ngày`, `Ghi chú`  "+ 
                "  FROM kyluat k, soquyetdinh sqd    "+ 
                "  WHERE k.`Số quyết định` = sqd.`id` ";

module.exports = class utilsKyLuat{
    
    constructor(id, idhs, sqd, hinhthuc, noidung, ngay, ghichu){
        this.id = id;
        this.idhs = idhs;
        this.sqd = sqd; // khoa chinh
        this.hinhthuc = share.encode(hinhthuc);
        this.noidung = share.encode(noidung);
        this.ngay = ngay;
        this.ghichu = share.encode(ghichu);
    }

    static async getAll(){
        var sql = " select * from view_kyluat;";
        return db.execute(sql);
    }

    static getAllpure(){
        var sql = sqlkyluatpure;
        return db.execute(sql);
    }

    static getById(id){
        var sql = sqlkyluatpure + " and k.`id` = ?";
        return db.execute(sql,[id]);
    }

    static getByIdHS(idhs){
        var sql = sqlkyluat + " and hs.`id` = ?";
        return db.execute(sql,[idhs]);
    }

    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;
        check = await findDifferent(oldinfo, info);
        if (check == 5) return -1;
        var sql = "select updateKyLuat(?,?,?,?,?,?,?,?,?) as result"
        var inserts = [userid, info.id, hanhdong, info.sqd, info.idhs, info.hinhthuc, info.noidung , info.ngay, info.ghichu];
        return db.execute(sql, inserts);
    }
    static insert(userid, ngaybanhanh, info){
        var sql = "select insertKyLuat(?,?,?,?,?,?,?,?) as result"
        var inserts = [userid, info.sqd, info.idhs, info.hinhthuc, info.noidung , info.ngay, info.ghichu, ngaybanhanh];
        return db.execute(sql, inserts);    
    }

    static async delete(id){
        var sql = "delete from `kyluat` where `id`= ? ";
        return db.execute(sql,[id]);
    }

    static deleteByIdHS(idhs){
        var sql = "DELETE FROM kyluat where `idhs` = ?";
        return db.execute(sql,[idhs]);
    }

    //FOR notification
    static getCurrent(){
        var sql = "SELECT k.`Số quyêt định` as `id`, h.`Họ và tên đệm`, h.`Tên` , null as full, " +
        " k.`Nội dung`, DATE_FORMAT(`Ngày`,'%Y-%m-%d') as `Ngày` " +
        " from kyluat k, hoso h " +
        " where h.`id` = k.`idhs` and datediff(`Ngày`, Curdate()) between 0 and 30 ";
        return db.execute(sql);
    }

    static async getTodayEvent(){
        var kt = await share.encode('Khai trừ');
        var sql = "select `id`, DATE_FORMAT(`Ngày`,'%d-%m-%Y') as `Ngày`, `idhs` "+
            " from kyluat "+
            " where `Hình thức kỷ luật` = ? and `Ngày` = curdate()";
        return db.execute(sql,[kt]);
    }

}

async function findDifferent(oldinfo, info){
    var check = 0;
    if (oldinfo[`Ngày`]        == info.ngay) {check++; info.ngay = null;}
    if (oldinfo[`Nội dung`]    == info.noidung) {check++; info.noidung = null;}
    if (oldinfo[`Hình thức kỷ luật`]   == info.hinhthuc) {check++; info.hinhthuc = null;}
    if (oldinfo[`Ghi chú`]     == info.ghichu) {check++; info.ghichu = null;}
    if (oldinfo[`id hồ sơ`]    == info.idhs) {check++; info.idhs = null;}
    return check;
}