const db = require('./connection');

module.exports = class utilsDonVi_ChucVu{
    
    constructor(id, donvi, chucvu){
        this.id = id;
        this.donvi = donvi;
        this.chucvu = chucvu;
    }

    static getAllpure(){
        var sql = "select * from donvi_chucvu";
        return db.execute(sql);
    }


    static getAll(){
        var sql = "select dv.`Tên` as `Đơn vị`, cv.`Tên` as `Chức vụ`, `Loại` "+
        " from donvi_chucvu dvcv, chucvu cv, donvi dv "+
        " where dvcv.donvi = dv.id and dvcv.chucvu = cv.id";
        return db.execute(sql);
    }

    static getChucVuDonVi(id){
        var sql = "select cv.`Tên` as `Chức vụ`, cv.`id`  "+
        " from donvi_chucvu dvcv, chucvu cv, donvi dv "+
        " where dvcv.donvi = dv.id and dvcv.chucvu = cv.id and dv.id = ?";
        return db.execute(sql,[id]);
    }

    static insert(info){
        var sql = "insert into `donvi_chucvu`(`donvi`,`chucvu`) values(?,?)";
        return db.execute(sql,[info.donvi, info.chucvu])
    }

    static update(info){
        var sql = "UPDATE `donvi_chucvu` SET `donvi` = ?, `chucvu` = ? WHERE (`id` = ?);"
        return db.execute(sql,[info.donvi, info.chucvu, info.id])
    }

    static delete(ids){
        var sql = "DELETE from `donvi_chucvu` where `id` in (?)";
        sql = require('mysql').format(sql,[ids]);
        return db.execute(sql)
    }

    static deleteByDonvi(id){
        return db.execute("Delete from `donvi_chucvu` where `donvi` = ? ",[id]);
    }


    static getRandom(id){
        var sql = "select chucvu as `id` from donvi_chucvu where donvi = ? order by rand() limit 1";
        return db.execute(sql,[id]);
    }
}