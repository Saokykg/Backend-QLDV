// const utils = require('../');
const db = require('./connection');


module.exports = class utilsChiBo{
    
    static getProvince(){
        var sql = "select id, name as `Tỉnh/Thành phố` from province ";
        return db.execute(sql);
    }
    static getDistrict(id){
        var sql = "select id, name as `Quận/Huyện` from district where province_id = ? ";
        return db.execute(sql,[id]);
    }

    static getFullDistrict(){
        var sql = "select id, name as `Quận/Huyện` from district ";
        return db.execute(sql);
    }

    static getFullWard(){
        var sql = "select id, name as `Phường/Xã` from ward ";
        return db.execute(sql);
    }
    
    static getWard(id){
        var sql = "select id, name as `Phường/Xã` from ward where district_id = ? ";
        // console.log(require('mysql').format(sql,[id]));
        return db.execute(sql,[id]);
    }

    static getFullinfo(id){
        var sql = "select w.id, concat(w.name, ', ' , d.name, ', ', p.name) as `Địa điểm` " + 
        "from province p, district d, ward w "+
        "where p.id = d.province_id and d.id = w.district_id and w.id = ? ";
        return db.execute(sql,[id]);
    }

    static getEachinfo(id){
        var sql = "select p.name as province, d.name as district, w.name as ward, w.id as idw, province_id as idp, district_id as idd "+
        " from province p, district d, ward w "+
        " where p.id = d.province_id and d.id = w.district_id and w.id = ? ";
        return db.execute(sql,[id]);
    }


    // user for edit - view full

    //Thanh pho/Tinh
    static getListProvince(){
        var sql = "select `id` as `Mã Tỉnh/Thành`, `name` as `Tỉnh/Thành` from province ";
        return db.execute(sql);
    }

    static getProvinceId(id){
        var sql = "select * from province where id = ? ";
        return db.execute(sql,[id]);
    }

    static insertProvince(id,name){
        var sql = "INSERT INTO `province` (`id`, `name`) VALUES (?,?)";
        return db.execute(sql,[id,name])
    }

    static updateProvince(id, name, idOld){
        var sql = "update `province` SET `id` =  ? , `name` = ? where id = ? ";
        return db.execute(sql,[id, name, idOld]);
    }

    static deleteProvince(id){
        var sql = "DELETE FROM `province` where id in (" + id +" )";
        return db.execute(sql,[id]);
    }

    //Quan/Huyen
    static getListDistrict(){
        var sql = "select d.`id` as `Mã Quận/Huyện`, d.`name` as `Quận/Huyện`, p.`id` as `Mã Tỉnh/Thành`, p.`name` as `Tỉnh/Thành`" + 
        " from district d, province p " +
        " where d.`province_id` = p.`id`";

        return db.execute(sql);
    }

    static getDistrictId(id){
        var sql = "select * from district where id = ? ";
        // console.log(require('mysql').format(sql,[id]));
        return db.execute(sql,[id]);
    }

    static insertDistrict(id, name, province_id){
        var sql = "INSERT INTO `district` (`id`, `name`, `province_id`) VALUES (?,?,?)";
        return db.execute(sql, [id, name, province_id])
    }

    static updateDistrict(id, name, pid, idOld){
        var sql = "update `district` SET `id` =  ? , `name` = ?, province_id = ? where id = ? ";
        return db.execute(sql,[id, name, pid, idOld]);
    }

    static deleteDistrict(id){
        var sql = "DELETE FROM `district` where id in (" + id +" )";
        return db.execute(sql,[id]);
    }
    //Phuong/Xa
    static getListWard(){
        var sql = "select w.`id` as `Mã Phường/Xã`, w.`name` as `Phường/Xã`, d.`id` as `Mã Quận/Huyện`, d.`name` as `Quận/Huyện`, p.`id` as `Mã Tỉnh/Thành`, p.`name` as `Tỉnh/Thành`" + 
        " from district d, province p, ward w" +
        " where d.`province_id` = p.`id` and w.`district_id` = d.`id` ";
        return db.execute(sql);
    }

    static getWardId(id){
        var sql = "select * from ward where id = ? ";
        return db.execute(sql,[id]);
    }

    static insertWard(id, name, Ward_id){
        var sql = "INSERT INTO `ward` (`id`, `name`, `ward_id`) VALUES (?,?,?)";
        return db.execute(sql, [id, name, Ward_id])
    }

    static updateWard(id, name, pid, idOld){
        var sql = "update `ward` SET `id` =  ? , `name` = ?, district_id = ? where id = ? ";
        return db.execute(sql,[id, name, pid, idOld]);
    }

    static deleteWard(id){
        var sql = "DELETE FROM `ward` where id in (" + id +" )";
        return db.execute(sql,[id]);
    }
}