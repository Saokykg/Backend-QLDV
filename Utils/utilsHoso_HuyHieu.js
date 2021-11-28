const db = require('./connection');
const share = require('../share');

var sqlhuyhieupure = "SELECT `idhs` as `id hồ sơ`,sqd.`id` as `id số quyết định`, sqd.`Số quyết định`,  DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, `idhh` as `id huy hiệu` , DATE_FORMAT(`Ngày cấp`,'%d-%m-%Y') as `Ngày cấp`" +
                "FROM hoso_huyhieu hs, soquyetdinh sqd " +
                "Where hs.`số quyết định` = sqd.`id`";

var sqlhuyhieu = "SELECT  hs.`Họ và tên đệm`, hs.`Tên`, DATE_FORMAT(`Ngày sinh`,'%d-%m-%Y') as `Ngày sinh`, sqd.`Số quyết định` , hhd.`Tên` as `Huy hiệu`,  DATE_FORMAT(`Ngày cấp`,'%d-%m-%Y') as `Ngày cấp` " +
                "FROM hoso_huyhieu hh, hoso hs, huyhieudang hhd, soquyetdinh sqd  "+
                "WHERE hs.`id` = hh.`idhs` and hhd.`id` = hh.`idhh` and hh.`số quyết định` = sqd.`id` ";

var sqlHuyhieumax ="select hs.`id`, hs.`Số thẻ đảng`, `Số lý lịch`, hs.`Họ và tên đệm`, hs.`Tên`, cb.`Tên chi bộ` as `Chi bộ`, DATE_FORMAT(`Ngày sinh`,'%d-%m-%Y') as `Ngày sinh`, `Giới tính`, DATE_FORMAT(sqd.`Ngày ban hành`, '%d-%m-%Y') as `Ngày kết nạp`, "+
                    " TIMESTAMPDIFF(year, sqd.`Ngày ban hành`,curdate()) as `Tuổi Đảng`, "+
                    " null as `Tổng số huy hiệu` ,null as `Đếm ngược ngày nhận` "+
                    " from  gianhapdang gn, soquyetdinh sqd, chibo cb, hoso hs JOIN lichsu_sinhoat as ls ON ls.`idhs` = hs.`id` "+
                    " where sqd.`id` = gn.`Số quyết định` and ls.`chibo` = cb.`id` and hs.`id` = gn.`id` and gn.`Loại` = '"+share.encode('Dự bị')+"' and isnull(ls.`end`) ";
module.exports = class utilsHoso_HuyHieu{

    constructor(idhs, idhh, ngaycap, sqd){
        this.idhs = idhs;
        this.idhh = idhh;
        this.ngaycap = ngaycap;
        this.sqd = sqd;
    }

    static async getMax(){
        var sql = "select * from view_huyhieu;";
        return db.execute(sql);
    }

    static getAll(){
        var sql = sqlhuyhieu;
        return db.execute(sql);
    }


    static getByid(id){
        var sql = sqlhuyhieupure + " and  sqd.`id` = ? ";
        // console.log(sql);
        return db.execute(sql,[id]);
    }

    static getAllpure(){
        var sql = sqlhuyhieupure;
        return db.execute(sql);
    }

    
    static getByIdNam(id, nam){
        var sql = "select * from hoso_huyhieu hshh, huyhieudang hh where `idhs` = ? and `Tên` like ? and `idhh` = hh.`id`";
        return db.execute(sql, [id, '%' + nam + '%'])
    }

    static getByIdHsHh(idhs, idhh){
        var sql = sqlhuyhieupure + " and `idhs` = ? and `idhh` = ?";
        return db.execute(sql,[idhs,idhh]);
    }

    static getMaxByidHs(idhs){
        var sql = "select TIMESTAMPDIFF(year, `Thời gian gia nhập`,curdate()) as `Tuổi Đảng` "+
        "from gianhapdang "+
        "where `id` = ? and `Loại` = '"+share.encode('Dự bị')+"' ";
        return db.execute(sql,[idhs]);
    }

    static getByIdHs(idhs){
        var sql = sqlhuyhieu + " and `idhs` = ? ";
        // console.log(sql);
        return db.execute(sql,[idhs]);
    }
    
    static getByIdHsPure(idhs){
        var sql = sqlhuyhieupure + " and  `idhs` = ? ";
        return db.execute(sql,[idhs]);
    }
    

    static getByIdHh(idhh){ // idhs
        var sql = sqlhuyhieu + " and `idhh` = ? ";
        return db.execute(sql,[idhh]);
    }

    static getCountDown(idhs, nam){
        var sql = "select datediff(DATE_ADD(min(`Ngày ban hành`), INTERVAL ? YEAR), curdate()) as `năm`"+
                " from gianhapdang gnd, soquyetdinh sqd " +
                " where sqd.`id` = gnd.`Số quyết định` and `idhs` = ? group by `idhs` ";
        return db.execute(sql,[nam, idhs]);
    }

    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;
        check = await findDifferent(oldinfo, info);
        if (check == 2) return -1;
        var sql = "Select updateHuyHieu(?,?,?,?,?,?) as resutl";
        var inserts = [userid, hanhdong, info.sqd, info.idhs, info.idhh, info.ngaycap];
        console.log(require('mysql').format(sql,inserts))
        return db.execute(sql, inserts);
    }
    static insert(userid, ngaybanhanh, info){
        var sql = "select InsertHuyHieu(?,?,?,?,?,?) as resutl"
        var inserts = [userid, ngaybanhanh, info.sqd, info.idhs, info.idhh, info.ngaycap];
        // console.log(require('mysql').format(sql, inserts));
        
        return db.execute(sql, inserts);
    }

    static delete(idhs, idhh){
        var sql = "DELETE FROM `hoso_huyhieu` where `idhs` = ? and `id huy hiệu` id in (" + idhh +" )";
        return db.execute(sql,[idhs]);
    }

    //FOR notification
    static getCurrent(date){
        var sql = "select hs.`id`, hs.`Họ và tên đệm`, hs.`Tên` , DATE_ADD(`Thời gian gia nhập`, INTERVAL (TIMESTAMPDIFF(year, gn.`Thời gian gia nhập`,curdate() )) + 1 YEAR) as `Ngày`,  "+
        "  TIMESTAMPDIFF(year, gn.`Thời gian gia nhập`,STR_TO_DATE(?,'%Y-%m-%d' )) as `Tuổi Đảng` "+
        "   from hoso hs, gianhapdang gn "+
        "  where hs.`id` = gn.`id` and gn.`Loại` = '"+share.encode('Dự bị')+"' and TIMESTAMPDIFF(month, gn.`Thời gian gia nhập`,curdate()) + 1  IN "+
        "  (360, 480, 600, 660, 720, 780, 840, 900, 960, 1020, 1080)" ;     
        // console.log(sql);  
        return db.execute(sql,[date]);
    }

    static check(idhs, year){
        var sql = "select * from hoso_huyhieu hshh, huyhieudang hh" +
        " where `idhh` = hh.`id`  and `idhs` = ? and `Năm` = ? ";
        return db.execute(sql,[idhs, year]);
    }
}

async function findDifferent(oldinfo, info){
    var check = 0;
    // console.log(oldinfo);
        if (oldinfo[`id huy hiệu`]== info.idhh)    {check++; info.idhh = null;}
        if (oldinfo[`Ngày cấp`]   == info.ngaycap) {check++; info.ngaycap = null;}
    return check;
}