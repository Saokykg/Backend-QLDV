const db = require('./connection');
const share = require('../share');

var sqlchuyensh = "select c.`id`, c.`Số quyết định` as `id số quyết định` , h.`Họ và tên đệm`, h.`Tên`, sqd.`Số quyết định`, DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, DATE_FORMAT(`Ngày đi`,'%d-%m-%Y') as `Ngày đi`,"+
                "  `Loại chuyển`, `Chuyển từ`, `Chuyển đến` "+
                "from chuyensh c, hoso h, soquyetdinh sqd "+
                "where h.`id` = c.`idhs` and sqd.`id` = c.`Số quyết định`  ";
var sqlchuyenshpure = "select c.`id` as `id`, c.`idhs` as `id hồ sơ` , sqd.`id` as `id số quyết định`, sqd.`Số quyết định`, DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, DATE_FORMAT(`Ngày đi`,'%d-%m-%Y') as `Ngày đi`,"+
                "  `Loại chuyển`, `Chuyển từ`, `Chuyển đến` "+
                "from chuyensh c, soquyetdinh sqd "+
                "where  sqd.`id` = c.`Số quyết định`  ";

module.exports = class utilsChuyenSH{
    
    constructor(id, idhs, sqd, ngayDi, loai, tu, den){
        this.id = id;
        this.idhs = idhs;
        this.sqd = sqd; //khoa chinh
        this.ngayDi = ngayDi;
        this.loai = share.encode(loai);
        this.tu = share.encode(tu);
        this.den = share.encode(den);
    }

    static async getAll(){
        var sql = "select * from view_chuyensh";
        // console.log(sql);
        return db.execute(sql);
    }

    static getAllpure(){
        var sql = sqlchuyenshpure;
        return db.execute(sql);
    }

    static getById(id){
        var sql = sqlchuyenshpure + " and c.`id` = ?";
        return db.execute(sql,[id]);
    }
    
    static getByIdHS(idhs){
        var sql = sqlchuyensh + "and h.`id` = ?";
        return db.execute(sql, [idhs]);
    }


    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;;
        check = await findDifferent(oldinfo, info);
        // console.log(oldinfo, info);
        if (check == 5) return -1;
        var sql = "select updateChuyenSH(?,?,?,?,?,?,?,?,?) as reuslt";
        var inserts = [userid, info.id, hanhdong, info.idhs, info.sqd, info.ngayDi, info.loai, info.tu, info.den];
        return db.execute(sql, inserts);
    }

    static insert(userid, ngay, info){
        var sql = "SELECT InsertChuyenSH(?,?,?,?,?,?,?,?) as result";
        var inserts = [userid, ngay, info.idhs, info.sqd, info.ngayDi, info.loai, info.tu, info.den];
        return db.execute(sql, inserts);
    }

    static async delete(id){
        var sql = "delete from `chuyensh` where `id` = ? ";
        return db.execute(sql,[id]);
    }

    static deleteByidhs(idhs){
        var sql = "delete from chuyensh where `idhs` = ?";
        return db.execute(sql,[idhs]);
    }

    //FOR notification
    static getCurrent(){
        var sql = "SELECT sh.`id`, h.`Họ và tên đệm`,  h.`Tên` , " +
        " sh.`Chuyển từ`, sh.`Chuyển đến` , DATE_FORMAT(`Ngày đi`,'%Y-%m-%d') as `Ngày` " +
        " from chuyensh sh, hoso h " +
        " where h.`id` = sh.`idhs` and datediff(`Ngày đi`, Curdate()) between 0 and 30";
        return db.execute(sql);
    }

    static getToday(){
        var sql = "select `idhs` as idhs, DATE_FORMAT(`Ngày đi`,'%d-%m-%Y') as ngay , `Chuyển từ` as tu, `Chuyển đến` as den, `Loại chuyển` as loai " +
            " from chuyensh where `Ngày đi` = curdate()";
        // console.log(sql);
        return db.execute(sql);
    }


    static getTodayEvent(){
        var sql = "select sh.`id`,`idhs`, DATE_FORMAT(`Ngày đi`,'%d-%m-%Y') as `Ngày đi`, `Loại chuyển`, `Chuyển đến` "+
            " from chuyensh sh, hoso hs "+
            " where sh.`idhs` = hs.`id` and `Ngày đi` = curdate()";
        return db.execute(sql);
    }
}

async function findDifferent(oldinfo, info){
    var check = 0;
    if (oldinfo[`Ngày đi`]     == info.ngayDi) {check++; info.ngayDi = null;}
    if (oldinfo[`Loại chuyển`] == info.loai) {check++; info.loai = null;}
    if (oldinfo[`Chuyển từ`]   == info.tu) {check++; info.tu = null;}
    if (oldinfo[`Chuyển đến`]  == info.den) {check++; info.den = null;}
    if (oldinfo[`id hồ sơ`]    == info.idhs) {check++; info.idhs = null;}
    return check;
}