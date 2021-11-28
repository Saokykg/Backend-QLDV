const db = require('./connection');

module.exports = class utilsDonVi{
    
    constructor(id, ten, loai){
        this.id = id;
        this.ten = ten;
        this.loai = loai
    }

    static getAll(){
        var sql = "select `id`, `Tên`, `Loại`, `active` as `Hoạt động` from donvi order by `Loại`";
        return db.execute(sql);
    }

    static getLoai(){
        var sql = "select `Loại` from donvi group by `Loại` order by `Loại`";
        return db.execute(sql);
    }

    static getById(id){
        var sql = "select `id`, `Tên`, `Loại`, `active` as `Hoạt động` from donvi where id = ? order by `Loại`";
        return db.execute(sql,[id]);
    }

    static insert(info){
        var sql = "insert into `donvi`(`Tên`,`Loại`) values(?,?)";
        return db.execute(sql,[info.ten, info.loai])
    }

    static update(info){
        var sql = "UPDATE `donvi` SET `Tên` = ?, `Loại` = ? WHERE (`id` = ?);"
        return db.execute(sql,[info.ten, info.loai, info.id])
    }

    static active(ids){
        var sql = "UPDATE `donvi` SET `active` = 1 where `id` in (?)";
        sql = require('mysql').format(sql,[ids]);
        return db.execute(sql)
    }
    
    static deactive(ids){
        var sql = "UPDATE `donvi` SET `active` = 0 where `id` in (?)";
        sql = require('mysql').format(sql,[ids]);
        return db.execute(sql)
    }

    static async delete(id){
        await db.execute("delete from donvi_chucvu where donvi = ?", [id]);
        return db.execute("delete from donvi where id = ?",[id]);
    }
    
    static getRandom(){
        var sql = "select id from donvi where id IN (select donvi from donvi_chucvu) order by rand() limit 1";
        return db.execute(sql);
    }
}