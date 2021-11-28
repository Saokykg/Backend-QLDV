const db = require('./connection');
const mysql = require('mysql2');
const share = require('../share');

var sqlgianhap = "select hs.`Họ và tên đệm`, hs.`Tên`,sqd.`Số quyết định`, DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, "+
            " `Loại`, DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày gia nhập`, `Nơi gia nhập`, sqd.`id` as `id số quyết định` "+ 
            " from `gianhapdang` gn, hoso hs, soquyetdinh sqd " +
            " where hs.`id` = gn.`idhs` and gn.`Số quyết định` = sqd.`id` ";
var sqlgianhappure = "select gn.`idhs`,sqd.`id` as `id số quyết định`,sqd.`Số quyết định`, DATE_FORMAT(sqd.`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, "+
                    " `Loại`, DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày gia nhập`, `Nơi gia nhập` "+
                    " from gianhapdang gn, soquyetdinh sqd "+
                    " where  gn.`Số quyết định` = sqd.`id`";
module.exports = class utilsGiaNhap{
    
    constructor(idhs, loai, thoigian, diadiem, sqd){
        this.idhs = idhs;
        this.loai = share.encode(loai);
        this.thoigian = thoigian;
        this.diadiem = share.encode(diadiem);
        this.sqd = sqd; // khoa chinh
    }

    static getAllpure(){
        var sql = sqlgianhappure;
        return db.execute(sql);
    }

    static getAll(){
        var sql = sqlgianhap;
        return db.execute(sql);
    }

    static getByIdHS(idhs){
        var sql = "select `idhs` as `id hồ sơ`, gn.`Số quyết định` as `id`, sqd.`Số quyết định`, DATE_FORMAT(`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành` , DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày gia nhập`, `Loại`, `Nơi gia nhập`  "+
        " from gianhapdang gn, soquyetdinh sqd where gn.`Số quyết định` = sqd.`id`  and gn.`idhs` = ?";
        return db.execute(sql,[idhs]);
    }

    static getById(id){
        var sql = "select `idhs` as `id hồ sơ` , gn.`Số quyết định` as `id`, sqd.`Số quyết định`, DATE_FORMAT(`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày gia nhập`,`Loại`, `Nơi gia nhập`  "+
        " from gianhapdang gn, soquyetdinh sqd where gn.`Số quyết định` = sqd.`id`  and gn.`Số quyết định` = ?";
        return db.execute(sql,[id]);
    }

    static getByIdLoai(id, loai){
        var ty = "";
        if (loai === 0)
            ty = "Dự bị";
        else
            ty = `Chính thức`;
        var sql = sqlgianhap + " and gn.`idhs` = ? and gn.`loại` = ?";
        return db.execute(sql,[id, ty]);
    }

    static getBanHanhDubi(idhs){
        var sql = "select `Ngày ban hành`, `Thời gian gia nhập` as `Ngày gia nhập` from gianhapdang gn, soquyetdinh sqd  where gn.`Số quyết định` = sqd.`id` and gn.`id` = ? and `Loại` = ? ";
        return db.execute(sql,[idhs, share.encode("Dự bị")]);
    }

    static getNoiGiaNhap(idhs){
        var sql = "select `Nơi gia nhập` as noi from gianhapdang where idhs = ? limit 1";
        return db.execute(sql,[idhs])
    }

    static getWithCount(){
        var sql = "select `id`, `idhs`, `Loại`, DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày gia nhập` " +
        ", `Nơi gia nhập`, count(`idhs`) as `count` from `gianhapdang` group by `idhs` ";
        return db.execute(sql);
    }

    static getGiaNhap(idhs, loai){
        var sql = "select `id`, `idhs`, `Loại`, DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày gia nhập`, `Nơi gia nhập`,"+
        " `Số quyết định` from gianhapdang where `idhs`= ? and `Loại` = ? ";
        return db.execute(sql,[idhs, share.encode(loai)]);
    }

    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;
        // console.log(oldinfo, info);
        check = await findDifferent(oldinfo, info);
        // console.log(oldinfo, info);
        if (check == 2) return -1;
        var sql = "select updateGiaNhapDang(?,?,?,?,?) as result ";
        var  inserts = [userid, hanhdong, info.thoigian, info.diadiem, info.sqd];
        // console.log(mysql.format(sql,inserts));
        return db.execute(sql, inserts);
    }
    

    static insert(userid, ngay, info){
        var inserts = [];
        var sql = "SELECT InsertGiaNhapDang(?,?,?,?,?,?,?) as result";
        inserts.push(userid, ngay, info.idhs, info.loai, info.thoigian, info.diadiem, info.sqd);
        // console.log(mysql.format(sql,inserts));
        return db.execute(sql, inserts);
    }

    static deleteByIdLoai(id, loai){
        var sql = "delete from `gianhapdang` where `idhs` = ? and `loại` = ?";
        return db.execute(sql,[id, loai]);
    }

    static delete(id, type){
        var sql = "delete from `gianhapdang` where `idhs` = ? and `Loại` = ? ";
        return db.execute(sql,[id,type]);
    }

    //notification
    static getEventHuyHieu(){
        var sql = "select `idhs`,hs.`Họ và tên đệm`, hs.`Tên`, hs.`Số thẻ đảng`,curdate(), TIMESTAMPDIFF(year, `Ngày ban hành`, curdate()) as `Năm`, " +
        " datediff(date_add(`Ngày ban hành`, INTERVAL TIMESTAMPDIFF(year, `Ngày ban hành`, curdate()) year), curdate()) as `countdown` " +
        " , date_add(`Ngày ban hành`, INTERVAL TIMESTAMPDIFF(year, `Ngày ban hành`, curdate()) year) as `Ngày` " + 
        " from gianhapdang gnd, soquyetdinh sqd, hoso hs where gnd.`Số quyết định` = sqd.`id` and " +
        " TIMESTAMPDIFF(year, `Ngày ban hành`, curdate()) IN (select `Năm` from huyhieudang) and " +
        " datediff(date_add(`Ngày ban hành`, INTERVAL TIMESTAMPDIFF(year, `Ngày ban hành`, curdate()) year), curdate()) IN " +
        " (0,1,7,15,30) ";
        return db.execute(sql);
    }

    static getEventGiaNhap(){
        var sql = "select `idhs`,hs.`Họ và tên đệm`, hs.`Tên`, hs.`Số thẻ đảng`, curdate(), count(`idhs`) as `sl`, "+
        " date_add(min(`Thời gian gia nhập`), INTERVAL 1 YEAR) as `db`, datediff(date_add(`Thời gian gia nhập`, INTERVAL 1 YEAR), curdate()) as `countdown` " +
        " from gianhapdang gnd, hoso hs " +
        " where hs.`id` = gnd.`idhs` and  " +
        " datediff(date_add(`Thời gian gia nhập`, INTERVAL 1 YEAR), curdate()) IN (0,1,7,15,30) " +
        " group by `idhs` " +
        " having `sl` = 1";
        return db.execute(sql);
    }

}


async function findDifferent(oldinfo, info){
    var check = 0;
    if (oldinfo[`Nơi gia nhập`]    == info.diadiem) {check++; info.diadiem = null;}
    if (oldinfo[`Ngày gia nhập`]   == info.thoigian)   {check++; info.thoigian = null;}
    return check;
}