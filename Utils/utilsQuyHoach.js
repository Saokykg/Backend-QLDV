// const utils = require('../');
const db = require('./connection');
const share = require('../share');
var sqlQuyHoach = "select sqd.`id`, sqd.`id` as `id số quyết định`, `Cấp quy hoạch`, sqd.`Số quyết định` ,  "+
    " DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, `Nhiệm kỳ`, qh.`Nội dung`, "+
    "  DATE_FORMAT(qh.`Ngày`,'%d-%m-%Y') as `Ngày`  "+
    " From `quyhoach` qh, `soquyetdinh` sqd "+
    " Where qh.`Số quyết định` = sqd.`id`"; 

module.exports = class utilsQuyHoach{
    
    constructor(id, nd, ngay, sqd, cap, nhiemky){
        this.id = id;
        this.nd = share.encode(nd);
        this.ngay = ngay;
        this.sqd = sqd;
        this.cap = share.encode(cap);
        this.nhiemky = nhiemky;
    }

    static getAll(){
        var sql = sqlQuyHoach;
        return db.execute(sql);
    }

    static getById(id){
        var sql = sqlQuyHoach +" and sqd.`id` = ? ";
        return db.execute(sql,[id]);
    }

    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;
        check = await findDifferent(oldinfo, info);
        if (check == 4) return -1;
        var sql = "Select updateQuyHoach(?,?,?,?,?,?,?) as result ";
        var inserts = [userid, hanhdong, info.sqd, info.nd, info.ngay, info.cap, info.nhiemky];
        return db.execute(sql, inserts);
    }
    static insert(userid, ngaybanhanh, info){
        var sql = "Select insertQuyHoach(?,?,?,?,?,?,?) as result ";
        var inserts = [userid, ngaybanhanh, info.sqd, info.nd, info.ngay, info.cap, info.nhiemky];
        return db.execute(sql, inserts);
    }

    static async delete(id){
        var sql = "delete from `quyhoach` where `Số quyết định` = ?";
        return db.execute(sql,[id]);
    }
}

async function findDifferent(oldinfo, info){
    var check = 0;
    // console.log(oldinfo, info);
    if (oldinfo[`Nội dung`]== info.nd) {check++; info.nd = null;}
    if (oldinfo[`Ngày`]    == info.ngay) {check++; info.ngay = null;}
    if (oldinfo[`Cấp quy hoạch`]== info.cap) {check++; info.cap = null;}
    if (oldinfo[`Nhiệm kỳ`]     == info.nhiemky) {check++; info.nhiemky = null;}
    return check;
}