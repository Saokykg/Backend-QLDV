const db = require('./connection');
const { insert } = require('./utilsKyLuat');
const share = require('../share');

var sqlDanhGia = "select * from danhgia"

module.exports = class utilsChuyenSH{
    
    constructor(id, idHS, nam, danhgia, xeploai, ghichu){
        this.id = id;
        this.idhs = idHS;
        this.nam = nam;
        this.danhgia = share.encode(danhgia);
        this.xeploai = share.encode(xeploai);
        this.ghichu = share.encode(ghichu);
    }

    static getAllpure(){
        var sql = sqlDanhGia;
        return db.execute(sqlDanhGia);
    }

    static async getAll(){
        var sql =  "Select `dg`.`id` AS `id`, `dg`.`idhs` as `id hồ sơ`,`hosopure`.`Số lý lịch` AS `Số lý lịch`,`hosopure`.`Số thẻ đảng` AS `Số thẻ đảng`,`hosopure`.`Mã VC/SV` AS `Mã VC/SV`,`hosopure`.`Họ và tên đệm` AS `Họ và tên đệm`,`hosopure`.`Tên` AS `Tên`,`hosopure`.`Ngày sinh` AS `Ngày sinh`,`hosopure`.`Ngày vào Đảng` AS `Ngày vào Đảng`,`hosopure`.`Giới tính` AS `Giới tính`,`Tên chi bộ` AS `Chi bộ`,`hosopure`.`Đơn vị công tác` AS `Đơn vị công tác`,`hosopure`.`Chức vụ` AS `Chức vụ`,`hosopure`.`Lý luận chính trị` AS `Lý luận chính trị`,`hosopure`.`Quê quán` AS `Quê quán`,`hosopure`.`Điện thoại` AS `Điện thoại`,`hosopure`.`Email` AS `Email`,`hosopure`.`Dân tộc` AS `Dân tộc`,`hosopure`.`Tôn giáo` AS `Tôn giáo`,`hosopure`.`Chức danh` AS `Chức danh`,`hosopure`.`Học vấn` AS `Học vấn`,`hosopure`.`Học vị` AS `Học vị`,`hosopure`.`d` AS `d`,`hosopure`.`Nơi ở` AS `Nơi ở`,`hosopure`.`Tốt nghiệp` AS `Tốt nghiệp`,`hosopure`.`Nghề nghiệp` AS `Nghề nghiệp`,`hosopure`.`Đối tượng` AS `Đối tượng`,`hosopure`.`db` AS `db`,`hosopure`.`ct` AS `ct`,`hosopure`.`po` AS `po`,`hosopure`.`do` AS `do`,`hosopure`.`wo` AS `wo`,`hosopure`.`pq` AS `pq`,`hosopure`.`dq` AS `dq`,`hosopure`.`wq` AS `wq`,`hosopure`.`Đảng` AS `Đảng`,`hosopure`.`Đoàn thể` AS `Đoàn thể`,`hosopure`.`Chính quyền` AS `Chính quyền`,`hosopure`.`Kiêm nhiệm` AS `Kiêm nhiệm`,`hosopure`.`Trạng thái` AS `Trạng thái`, "+
        " `Năm`, `Đánh giá`, `Xếp loại`, dg.`Ghi chú` " +
        "from hosopure , danhgia dg, chibo cb  where dg.`idhs` = `hosopure`.`id` and `hosopure`.`Chi bộ` = cb.`id` ";
        return db.execute(sql);
    }

    static getById(id){
        var sql = "select `danhgia`.`id` AS `id`,`danhgia`.`idhs` AS `id hồ sơ`,`danhgia`.`Năm` AS `Năm`,`danhgia`.`Đánh giá` AS `Đánh giá`, " +
         " `danhgia`.`Xếp loại` AS `Xếp loại`,`danhgia`.`Ghi chú` AS `Ghi chú` "+
         " from `danhgia`  where `id` = ? ";
        return db.execute(sql,[id]);
    }

    static getByIdHS(id){
        var sql = "select `danhgia`.`id` AS `id`,`danhgia`.`idhs` AS `id hồ sơ`,`danhgia`.`Năm` AS `Năm`,`danhgia`.`Đánh giá` AS `Đánh giá`, " +
        " `danhgia`.`Xếp loại` AS `Xếp loại`,`danhgia`.`Ghi chú` AS `Ghi chú` "+
        " from `danhgia`  where `danhgia`.`idhs` = ? ";
        return db.execute(sql,[id]);
    }

    static insert(userid, info){
        var sql = "Select InsertDanhGia(?,?,?,?,?,?) as result";
        var inserts = [userid, info.idhs, info.nam, info.danhgia, info.xeploai, info.ghichu];
        return db.execute(sql, inserts);
    }


    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;
        check = await findDifferent(oldinfo, info);
        if (check == 5) return -1;
        var sql = "Select updateDanhGia(?,?,?,?,?,?,?,?) as result";
        var inserts = [userid, hanhdong, info.id, info.idhs, info.nam, info.danhgia, info.xeploai, info.ghichu];
        // console.log(require('mysql').format(sql, inserts));
        return db.execute(sql,inserts)
    }

    static async delete(id){
        var sql = "delete from `danhgia` where `id` = ? ";
        return db.execute(sql,[id]);
    }
}

async function findDifferent(oldinfo, info){
    var check = 0;
        if (oldinfo[`Năm`]      == info.nam)     {check++; info.nam = null;}
        if (oldinfo[`Đánh giá`] == info.danhgia) {check++; info.danhgia = null;}
        if (oldinfo[`Xếp loại`] == info.xeploai) {check++; info.xeploai = null;}
        if (oldinfo[`Ghi chú`]  == info.ghichu)  {check++; info.ghichu = null;}
        if (oldinfo[`id hồ sơ`] == info.idhs)    {check++; info.idhs = null;}
    return check;
}