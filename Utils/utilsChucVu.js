const db = require('./connection');

// var sqlChucVu2 = "select `id chức vụ`,`id hồ sơ` , `Tên` "+
//                 " from `chucvu` c, `hoso_chucvu` h" +
//                 " where c.`id` = h.`id chức vụ` ";
var sqlChucVu = "select * from chucvu ";
module.exports = class utilsChucVu{
    
    constructor(id, ten){
        this.id = id;
        this.ten = ten;
    }

    static getAll(){
        var sql = sqlChucVu;
        return db.execute(sql);
    }

    static getById(id){
        var sql = "select * from chucvu where  `id` = ?";
        return db.execute(sql,[id]);
    }

    static getByName(ten){
        var sql = sqlChucVu + " where `Tên` like ?";
        return db.execute(sql,"%" + [ten] + "%");
    }
    
    static getByIdHS(id){
        var sql = "select `id chức vụ`, `Tên`, `Loại` from chucvu c, hoso_chucvu h where `id chức vụ` = c.`id` and  `id hồ sơ` = ?";
        return db.execute(sql,[id]);
    }
    
    static update(id, ten){
        var sqltop = "update `chucvu` set ";

        var sqlmid ="";
        var inserts = [];
        sqlmid += " `Tên` = ? ";  inserts.push(ten);

        var sqlbot = " where `id` = ? ";
        inserts.push(id);

        var sql = sqltop + sqlmid +sqlbot;
        return db.execute(sql, inserts);
    }
    static insert(ten){
        // console.log(ten);
        var sql = "INSERT INTO `chucvu` (`Tên`) VALUES (?)";
        var inserts = [ten];
            
        return db.execute(sql, inserts);
    }

    static async delete(userid, id){
        for (const id of ids)
            await db.execute("call saveAction(?,'chucvu','Xóa',? ) ",[userid, id]);
        var sql = "DELETE FROM `chucvu` where id in (?)";
        sql = require('mysql').format(sql, [ids]);
        return db.execute(sql);
    }

}