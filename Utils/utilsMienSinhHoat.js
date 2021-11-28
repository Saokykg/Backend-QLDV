const db = require('./connection');
const mysql = require('mysql2');
const share = require('../share');

var sqlMain = " select ls.id, h.`Số thẻ đảng`, h.`Số lý lịch`, h.`Họ và tên đệm`, h.`Tên`, h.`Giới tính`,DATE_FORMAT(h.`Ngày sinh`,'%d-%m-%Y') as `Ngày sinh`, DATE_FORMAT(`start`,'%d-%m-%Y') as `Từ ngày`, DATE_FORMAT(`end`,'%d-%m-%Y') as `Đến ngày` "+
        " from lichsu_miensinhhoat ls, hoso h" +
        " where ls.`id` = h.`id` ";

module.exports = class utilsMienSinhHoat{
    
    constructor(id, idhs,start, end){
        this.id = id;
        this.idhs = idhs;
        this.start = start;
        if (end == '') this.end = null;
        this.end = end;
    }

    static async getAll(){
        var sql = "select sh.`idhs` as `id hồ sơ`, sh.`id`, `hosopure`.`Số lý lịch` AS `Số lý lịch`,`hosopure`.`Số thẻ đảng` AS `Số thẻ đảng`,`hosopure`.`Mã VC/SV` AS `Mã VC/SV`,`hosopure`.`Họ và tên đệm` AS `Họ và tên đệm`,`hosopure`.`Tên` AS `Tên`,`hosopure`.`Ngày sinh` AS `Ngày sinh`,`hosopure`.`Ngày vào Đảng` AS `Ngày vào Đảng`,`hosopure`.`Giới tính` AS `Giới tính`,`Tên chi bộ` AS `Chi bộ`,`hosopure`.`Đơn vị công tác` AS `Đơn vị công tác`,`hosopure`.`Chức vụ` AS `Chức vụ`,`hosopure`.`Lý luận chính trị` AS `Lý luận chính trị`,`hosopure`.`Quê quán` AS `Quê quán`,`hosopure`.`Điện thoại` AS `Điện thoại`,`hosopure`.`Email` AS `Email`,`hosopure`.`Dân tộc` AS `Dân tộc`,`hosopure`.`Tôn giáo` AS `Tôn giáo`,`hosopure`.`Chức danh` AS `Chức danh`,`hosopure`.`Học vấn` AS `Học vấn`,`hosopure`.`Học vị` AS `Học vị`,`hosopure`.`d` AS `d`,`hosopure`.`Nơi ở` AS `Nơi ở`,`hosopure`.`Tốt nghiệp` AS `Tốt nghiệp`,`hosopure`.`Nghề nghiệp` AS `Nghề nghiệp`,`hosopure`.`Đối tượng` AS `Đối tượng`,`hosopure`.`db` AS `db`,`hosopure`.`ct` AS `ct`,`hosopure`.`Ghi chú` AS `Ghi chú`,`hosopure`.`po` AS `po`,`hosopure`.`do` AS `do`,`hosopure`.`wo` AS `wo`,`hosopure`.`pq` AS `pq`,`hosopure`.`dq` AS `dq`,`hosopure`.`wq` AS `wq`,`hosopure`.`Đảng` AS `Đảng`,`hosopure`.`Đoàn thể` AS `Đoàn thể`,`hosopure`.`Chính quyền` AS `Chính quyền`,`hosopure`.`Kiêm nhiệm` AS `Kiêm nhiệm`,`hosopure`.`Trạng thái` AS `Trạng thái`, DATE_FORMAT(`start`,'%d-%m-%Y') as `Từ ngày` , DATE_FORMAT(`end`,'%d-%m-%Y') as `Đến ngày` " +
                " from hosopure, lichsu_miensinhhoat sh , `chibo` cb "+
                " where `hosopure`.`id` = sh.`idhs` and cb.`id` = `hosopure`.`Chi bộ`";
        return db.execute(sql);
    }

    static getById(id){
        var sql = "select id, idhs as `id hồ sơ`, DATE_FORMAT(`start`,'%d-%m-%Y') as `Từ ngày`, DATE_FORMAT(`end`,'%d-%m-%Y') as `Đến ngày` "+
        " from lichsu_miensinhhoat where  `id` = ? ";
        return db.execute(sql,[id]);
    }

    static getByIdHs(id){
        var sql = sqlMain + " and h.`id` = ? ";
        return db.execute(sql,[id]);
    }

    static insert(userid, info){
        var sql = "select InsertMienSH(?,?,?,?) as reuslt ";
        var inserts = [userid, info.idhs, info.start, info.end];
        return db.execute(sql, inserts);
    }

    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;
        // console.log(oldinfo, info);
        check = await findDifferent(oldinfo, info);
        if (check == 3) return -1;
        var sql = "select UpdateMienSH(?,?,?,?,?,?) as reuslt ";
        var inserts = [userid, hanhdong, info.id, info.idhs, info.start, info.end];
        // console.log(mysql.format(sql, inserts));
        return db.execute(sql, inserts);
    }

    static async delete(id){
        var sql = "delete from `lichsu_miensinhhoat` where `id` in (?)";
        return db.execute(sql,[id]);
    }

}

async function findDifferent(oldinfo, info){
    var check = 0;
        if (oldinfo[`Từ ngày`]   == info.start) {check++; info.start = null;}
        if (oldinfo[`Đến ngày`]  == info.end) {check++; info.end = null;}
        if (oldinfo[`id hồ sơ`]  == info.idhs) {check++; info.idhs = null;}
    return check;
}