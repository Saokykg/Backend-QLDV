const utils = require('../middleware/utils');
const db = require('./connection');
require('dotenv').config();
var jwt = require('jsonwebtoken')
var share = require('../share');
var mysql = require('mysql');
module.exports = class utilsGroup{

    constructor(id, name, des){
        this.id = id;
        this.name = name;
        this.des = des;
    }

    static getFullGroup(){
        var sql ="select * from `group` ";
        return db.execute(sql);
    }

    static getGroup(){
        var sql ="select * from `group` where `active`";
        return db.execute(sql);
    }

    static getGroupId(id){
        var sql ="select * from `group` where `id` = ? ";
        return db.execute(sql,[id]);
    }

    static insert(info){
        var sql = "INSERT INTO `group`(`name`,`description`) VALUES (?,?) "; 
        return db.execute(sql,[info.name, info.des]);
    }

    static update(info){
        var sql = "UPDATE `group` SET `name` = ? , `description` = ? where `id` = ? ";
        return db.execute(sql,[info.name, info.des, info.id])
    }

    static active(ids){
        var sql = "UPDATE `group` SET `active` = ? where `id` in ( ";
        for (const id of ids){
            sql += " ? ,";
        }
        sql = sql.substring(0, sql.length -5) + ")";
        return db.execute(sql, ids);
    }

    static getGroupPermission(id){
        var sql = "select f.`id` as `function_id`, f.`display_name` as `function`, group_concat(p.`id`) as `permission`  "+
        " from `permission` p, `function` f, `group_permission` gp  "+
        " where p.`id` = gp.`permission_id` and f.`id` = gp.`function_id`  and gp.`group_id` = ? "+
        " group by f.`display_name` ";
       return db.execute(sql,[id]);
    }

    static insertGroupPermission(group_id, permis){
        var inserts = [];
        var sql = "Insert into `group_permission`(`group_id`, `function_id`, `permission_id`) VALUES ";
        var sqlmid = " (?,?,?),";
        for(const per of permis.permission){
            inserts.push(group_id, permis.function_id, per);
            sql+=sqlmid;
        }
        sql = sql.substring(0, sql.length - 1);
        return db.execute(sql,inserts)
    }

    static deleteGroupPermission(group_id){
        var sql = "delete from `group_permission` where `group_id` = ? ";
        return db.execute(sql,[group_id]);
    }

    static getUserInGroup(groupid){
        var sql = "select ROW_NUMBER() OVER (ORDER BY ac.`id`) AS `STT`,ac.`id`,hs.`Số lý lịch`, hs.`Số thẻ đảng`, hs.`Mã VC/SV`, hs.`Họ và tên đệm`, hs.`Tên`, "+
        " hs.`Ngày sinh`, hs.`Chi bộ`, hs.`Trạng thái` ,`username`, ac.`email`, `status`, hs.`id` as `id hồ sơ`  "+
        " from `account_group` qg, `account` ac LEFT JOIN `hosopure` hs "+
        " ON ac.`hoso_id` = hs.`id` "+
        " where qg.`account_id`= ac.`id` and qg.`group_id`= ? and ac.`permission` != 'admin' "
        return db.execute(sql,[groupid])
    }

    static addUserGroup(group_id, user_id){
        var sql = "insert into `account_group`(`account_id`, `group_id`) VALUES(?,?) ";
        return db.execute(sql,[user_id, group_id]);
    }

    static removeUserGroup(group_id, user_id){
        var sql = "delete from `account_group` where `account_id` =? and `group_id` =?"
        return db.execute(sql,[user_id, group_id])
    }

    static deleteUserGroup(id){
        var sql = "delete from `account_group` where `account_id` = ?";
        return db.execute(sql,[id]);
    }

};
