const db = require('./connection');
const share = require('../share');

var sqlngoaiquocpure = "select ct.`id` as `id` ,`idhs` as `id hồ sơ`, sqd.`id` as `id số quyết định`, sqd.`Số quyết định`,  "+
        " DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, `Loại` , DATE_FORMAT(`Ngày đi`,'%d-%m-%Y') as `Ngày đi`,   "+
        " DATE_FORMAT(`Ngày về`,'%d-%m-%Y') as  `Ngày về`, ct.`Nội dung`, `Nơi đến`  "+
        " FROM congtacngoaiquoc ct, soquyetdinh sqd "+ 
        " where ct.`Số quyết định` = sqd.`id`  ";
var sqlngoaiquoc = "select ct.`id`, h.`Họ và tên đệm`, h.`Tên`, sqd.`Số quyết định`,  DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, `Loại`, DATE_FORMAT(`Ngày đi`,'%d-%m-%Y') as `Ngày đi`, "+
                " DATE_FORMAT(`Ngày về`,'%d-%m-%Y') as  `Ngày về`, ct.`Nội dung`, `Nơi đến` " +
                "FROM congtacngoaiquoc ct, hoso h, soquyetdinh sqd " +
                "WHERE h.`id` = ct.`idhs` and ct.`Số quyết định` =sqd.`id` ";

module.exports = class utilsNgoaiQuoc{
    
    constructor(id, idhs, sqd , loai, ngaydi, ngayve, noidung, noiden){
        this.id = id;
        this.idhs = idhs;
        this.sqd = sqd;
        this.loai = share.encode(loai);
        this.ngaydi = ngaydi;
        this.ngayve = ngayve;
        this.noidung = share.encode(noidung);
        this.noiden  = share.encode(noiden);
    }

    static async getAll(){
        var sql = " SELECT * FROM view_ngoaiquoc;";
        return db.execute(sql);
    }

    static getAllpure(){
        var sql = sqlngoaiquocpure;
        // console.log(sql);
        return db.execute(sql);
    }

    static getById(id){
        var sql = sqlngoaiquocpure + " and ct.`id` = ?";
        // console.log(sql);
        return db.execute(sql,[id]);
    }

    static getByIdHs(idhs){
        var sql = sqlngoaiquocpure + " and ct.`idhs` = ?";
        // console.log(sql);
        return db.execute(sql,[idhs]);
    }

    static async update(userid, hanhdong, oldInfo, info){
        var check = 0;
        check = await findDifferent(oldInfo, info);

        if (check == 6) return -1 ;
        var sql = "SELECT updateNgoaiQuoc(?,?,?,?,?,?,?,?,?,?) as result";
        var inserts = [userid, info.id, hanhdong, info.idhs, info.sqd, info.loai, info.ngaydi, info.ngayve, info.noidung, info.noiden];
        // console.log(inserts);
        return db.execute(sql, inserts);
    }
    static insert(userid, ngaybanhanh, info){
        var sql = "SELECT InsertNgoaiQuoc(?,?,?,?,?,?,?,?,?) as result ";
        var inserts = [userid, info.idhs, info.sqd, info.loai, info.ngaydi, info.ngayve, info.noidung, info.noiden, ngaybanhanh];
        return db.execute(sql, inserts);
    }

    static async delete(id){
        var sql = "delete from `congtacngoaiquoc` where `id` = ?";
        sql = require('mysql').format(sql, id);
        return db.execute(sql);
    }

    static deleteByIdHS(idhs){
        var sql = "delete from `congtacngoaiquoc` where `idhs` = ?";
        return db.execute(sql,[idhs]);
    }

    //FOR notification
    static getCurrent(){
        var sql = "SELECT ct.`id`, h.`Họ và tên đệm`,  h.`Tên`, `Nơi đến`,  " +
        " ct.`Loại`, ct.`Nội dung` , DATE_FORMAT(`Ngày đi`,'%Y-%m-%d') as `Ngày` " +
        " from congtacngoaiquoc ct, hoso h " +
        " where h.`id` = ct.`idhs` and datediff(`Ngày đi`, Curdate()) between 0 and 30 ";
        return db.execute(sql);
    }
}

async function findDifferent(oldinfo, info){
    var check = 0;
    if (oldinfo[`Ngày đi`]    == info.ngaydi) {check++; info.ngaydi = null;}
    if (oldinfo[`Ngày về`]    == info.ngayve) {check++; info.ngayve = null;}
    if (oldinfo[`Loại`]    == info.loai) {check++; info.loai = null;}
    if (oldinfo[`Nội dung`]   == info.noidung) {check++; info.noidung = null;}
    if (oldinfo[`Nơi đến`]    == info.noiden) {check++; info.noiden = null;}
    if (oldinfo[`id hồ sơ`]       == info.idhs) {check++; info.idhs = null;}
    return check;
}