const { execute } = require('./connection');
const db = require('./connection');
const share = require('../share');
// ROW_NUMBER() OVER (ORDER BY `h.`Họ và tên đệm`, h.`Tên` DESC) AS `STT`
var sqlthanhtich = "SELECT  t.`id` as `id` , t.`idhs` as `id hồ sơ`, sqd.`id` as `id số quyết định`, sqd.`Số quyết định`,   " +
            "  DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, DATE_FORMAT(`Ngày khen thưởng`,'%d-%m-%Y') as `Ngày khen thưởng`, " +
            "  `Cấp` ,`Tên thành tích`, `Khen thưởng`, `Loại khen thưởng` " +
            "  FROM thanhtich t, soquyetdinh sqd  " +
            "  where  t.`Số quyết định` = sqd.`id`  "; 
var sqlthanhtichpure = "SELECT  t.`id` , `id hồ sơ`, sqd.`id` as `id số quyết định`, sqd.`Số quyết định`,  DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, DATE_FORMAT(`Ngày khen thưởng`,'%d-%m-%Y') as `Ngày khen thưởng`,"+
                " `Cấp` ,`Tên thành tích`, `Khen thưởng`, `Loại khen thưởng` " +
                "FROM thanhtich t, soquyetdinh sqd "+
                "where  t.`Số quyết định` = sqd.`id` ";

module.exports = class utilsthanhtich{
    
    constructor(id, idhs, sqd , ngay, cap, ten, khenthuong, loai){
        this.id = id
        this.idhs = idhs;
        this.sqd = sqd;
        this.ngay = ngay;
        this.cap = share.encode(cap);
        this.ten = share.encode(ten);
        this.khenthuong = share.encode(khenthuong);
        this.loai = share.encode(loai);
    }

    static async getAll(){
        var sql = "select * from view_thanhtich";
        // console.log(sql);
        return db.execute(sql);
    }

    static getAllpure(){
        var sql = sqlthanhtichpure +" order by t.`Số quyết định` ";
        return db.execute(sql);
    }

    static getById(id){
        var sql =  sqlthanhtich + " and t.`id` = ?";
        // console.log(sql);
        return db.execute(sql,[id]);
    }

    static getByIdHS(idhs){
        var sql = sqlthanhtich + " and  t.`idhs` = ? ";
        // console.log(sql);
        return db.execute(sql,[idhs]);
    }

    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;
        check = await findDifferent(oldinfo, info);
        if (check == 6) return -1;
        var sql = "select updateThanhTich(?,?,?,?,?,?,?,?,?,?) as result"
        var inserts = [userid, info.id, hanhdong, info.sqd, info.idhs, info.ngay, info.cap, info.ten, info.khenthuong, info.loai];
        // console.log(inserts);
        return db.execute(sql, inserts);
    }

    static insert(userid, ngaybanhanh, info){
        var sql = "select InsertThanhTich(?,?,?,?,?,?,?,?,?) as result"
        var inserts = [userid, info.sqd, info.idhs, info.ngay, info.cap, info.ten, info.khenthuong, info.loai, ngaybanhanh];
        // console.log(require('mysql').format(sql, inserts));
        return db.execute(sql, inserts);
    }

    static async delete(id){
        var sql = "delete from `thanhtich` where `id` = ?";
        return db.execute(sql,[id]);
    }
    
    static deleteByIdHS(idhs){
        var sql = "delete from thanhtich where `id hồ sơ` = ?";
        return db.execute(sql,[idhs]);
    }

    //FOR notification
    static getCurrent(){
        var sql = "SELECT tt.`id`, h.`Họ và tên đệm`, h.`Tên`, " +
        " tt.`Tên thành tích` as t , DATE_FORMAT(`Ngày khen thưởng`,'%Y-%m-%d') as `Ngày`, `Cấp` " +
        " from thanhtich tt, hoso h " +
        " where h.`id` = tt.`id hồ sơ` and datediff(`Ngày khen thưởng`, Curdate()) between 0 and 30 ";
        return db.execute(sql);
    }
}


async function findDifferent(oldinfo, info, check){
    var check = 0;
    if (oldinfo[`Ngày khen thưởng`] == info.ngay) {check++; info.ngay = null;}
    if (oldinfo[`Cấp`]              == info.cap) {check++; info.cap = null;}
    if (oldinfo[`Tên thành tích`]   == info.ten) {check++; info.ten = null;}
    if (oldinfo[`Khen thưởng`]      == info.khenthuong) {check++; info.khenthuong = null;}
    if (oldinfo[`Loại khen thưởng`] == info.loai) {check++; info.loai = null;}
    if (oldinfo[`id hồ sơ`]         == info.idhs) {check++; info.idhs = null;}
    return check;
}