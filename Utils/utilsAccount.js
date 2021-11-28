const utils = require('../middleware/utils');
const db = require('./connection');
require('dotenv').config();
var jwt = require('jsonwebtoken')
var share = require('../share');
var mysql = require('mysql')
module.exports = class utilsAccount{

    constructor(id, username, password, email, status, key, mail, idhs){
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.status = status;
        this.key = key;
        this.mail = mail
        this.idhs = idhs
    }

    static getEmail(){
        var sql = "select email from account where MailService = 1";
        return db.execute(sql);
    }

    static register(info){
        var sql = " INSERT INTO `quanlydangvien`.`account` (`permission`,`username`, `password`, `email`,`mailService`,`hoso_id`) VALUES (?,?,?,?,?,?)";
        var inserts = ['user', info.username, info.password, info.email, info.mail, info.idhs];
        // console.log(mysql.format(sql,inserts));
        return db.execute(sql,inserts);
    }
    
    static update(info){
        var sqltop = "Update account set ";
        var sqlmid = '';
        var inserts = [];
        
        if (info.password !== null) {sqlmid += ", `password` = ? "; inserts.push(info.password)}
        if (info.email !== null) {sqlmid += ", `email` = ? "      ; inserts.push(info.email)}
        if (info.mail !== null) {sqlmid += ", `mailService` = ? " ; inserts.push(info.mail)}
        if (info.idhs !== null) {sqlmid += ", `hoso_id` = ? " ; inserts.push(info.idhs)}
        
        var sqlbot = " where `id` = ? ";
        inserts.push(info.id);

        var sql = sqltop + sqlmid.substring(1) +sqlbot;
        // console.log(inserts);
        return db.execute(sql, inserts);

    }

    static updatePass(id, pass){
        var sql = " Update account set password = ? where id = ? ";
        return db.execute(sql,[pass, id])
    }

    static getById(id){
        return db.execute('Select ac.*, `Chi bộ` from account ac left join hoso hs on hs.`id` = ac.`hoso_id` where ac.`id`= ?', [id]);
    }

    static getByidhs(idhs){
        return db.execute("select ac.*, gr.`name` from `account` ac , `group` gr, `account_group` ag "+
        " where ac.`id` = ag.`account_id` and gr.`id` = ag.`group_id` and hoso_id = ?", [idhs]);
    }

    static getByUsername(username){
        return db.execute('Select * from account where username = ?', [username]);
    }

    static updateToken(token, id, ){ //rt = client refreshtoken (req.body.token)
        return db.execute('update account set refreshtoken = ? where id = ?',[token,id]);
    }

    static getTokenById(id){
        return db.execute('select refreshtoken from account where id = ?',[id]);
    }

    static getTokenByUsername(username){
        return db.execute('select refreshtoken from account where username = ?',[username]);
    }

    static updateKey(key, username){
        var sql = "update `account` set `key` = ? where `username` = ? ";
        // console.log(require('mysql').format(sql,[key, username]));
        return db.execute(sql,[key, username]);
    } 

    static updateStatus(stat, username){
        var sql = "update `account` set `status` = ? where `username` = ?";
        return db.execute(sql,[stat, username]);
    }

    static active(id, act){
        var sql = "update `account` set `active` = ? where `id` = ? ";
        return db.execute(sql, [act, id])
    }

    //permission

    static checkPer(id){
        var sql = "select DISTINCT f.`name` , group_concat(p.`name`) as `permission`  "+
        " from "+
        " (select DISTINCT  gp.`function_id`, gp.`permission_id` "+
        " from `group_permission` gp, `account` ac, `account_group` qg, `group` g "+
        " where qg.`account_id` = ac.`id` and gp.`group_id` = qg.`group_id` and g.`id` = qg.`group_id` and g.`active` and  "+
        " ac.`id` = ? "+
        " UNION "+
        " select `function_id`, `permission_id` "+
        " from `account_permission` where `account_id` = ? ) t1, `function` f, `permission`p "+
        " where p.`id` = t1.`permission_id` and f.`id` = t1.`function_id` "+
        " group by t1.`function_id`";
        return db.execute(sql,[id, id]);
    }

    static getPermisForLogin(id){
         var sql = " select DISTINCT f.`name` as `function`, f.`route`, group_concat(p.`name`) as `permission` "+
        "  from "+
        "  (select DISTINCT  gp.`function_id`, gp.`permission_id` "+
        "  from `group_permission` gp, `account` ac, `account_group` qg, `group` g "+
        "  where qg.`account_id` = ac.`id` and gp.`group_id` = qg.`group_id` and g.`id` = qg.`group_id` and g.`active` and  "+
        "  ac.`id` = ? "+
        "  UNION "+
        "  select `function_id`, `permission_id` "+
        "  from `account_permission` where `account_id` = ?) t1, `function` f, `permission` p "+
        "  where p.`id` = t1.`permission_id` and f.`id` = t1.`function_id` "+
        "  group by t1.`function_id`;";
       return db.execute(sql,[id, id]);
    }

    static getPermission(id){
        var sql = "select f.`group`,f.`id` as `function_id`, f.`display_name` as `function`, group_concat(p.`id`) as `permission`  "+
        " from `permission` p, `function` f, `account_permission` ap  "+
        " where p.`id` = ap.`permission_id` and f.`id` = ap.`function_id`  and ap.`account_id` = ? "+
        " group by f.`display_name` ";
       return db.execute(sql,[id]);
   }

   static getUser(){
       var sql = "select ROW_NUMBER() OVER (ORDER BY ac.`id`) AS `STT`, ac.`id`,hs.`Số lý lịch`, hs.`Số thẻ đảng`, "+
       " hs.`Mã VC/SV`, hs.`Họ và tên đệm`, hs.`Tên`, hs.`Ngày sinh`, hs.`Chi bộ`, hs.`Trạng thái` , "+
       " cv.`Đơn vị`, null as `Chức vụ`, cv.`Đảng`, cv.`Chính quyền`,  cv.`Đoàn thể`, "+
       " `username`, ac.`email`, `status` , group_concat(ag.`name`) as `Vai trò`, `group_id` "+
       " from `account` ac   "+
       " LEFT JOIN `hosopure` hs ON ac.`hoso_id` = hs.`id`    "+
       " LEFT JOIN (select g.`name`, `account_id`, `group_id` from `account_group` ag, `group` g where g.`id` = ag.`group_id`) ag   "+
       " ON ag.`account_id` = ac.`id`  "+
       " LEFT JOIN (select * from `view_chucvu_info`) cv ON cv.`idhs` = hs.`id` "+
       " where ac.`permission` != 'admin' and ac.`active` = true "+
       " group by ac.`id` "; 
       return db.execute(sql);
   }

   static getUserId(id){
    var sql = "select ROW_NUMBER() OVER (ORDER BY ac.`id`) AS `STT`,ac.`id`,hs.`id` as `id hồ sơ` ,`username`, ac.`email`, `status`, "+
    " group_concat(`group_id`) as `group` "+
    " from `account` ac  "+
    " LEFT JOIN `hosopure` hs ON ac.`hoso_id` = hs.`id` "+
    " LEFT JOIN `account_group` ag ON ag.`account_id` = ac.`id`     "+
    " where  ac.`id` = ? and ac.`permission` != 'admin' ";
    return db.execute(sql,[id]);
   }

    static getPerName(){
        var sql = "select f.`group`,f.`id` as `function_id`, f.`display_name` as `function`, group_concat(p.`name`, ';', p.`id`) as `permission` , f.`note`"+ 
        " from `permission` p, `function` f, `function_permission` fp "+ 
        " where p.`id` = fp.`permission_id` and f.`id` = fp.`function_id` "+ 
        " group by f.`display_name` "+ 
        " order by  f.`group`, f.`id` ";
        // console.log(sql);
        return db.execute(sql);
    }

    static deletePermission(userid){
        var sql = "delete from `account_permission` where `account_id` = ?";
        return db.execute(sql,[userid]);
    }

    static insertPermission(userid, permis){
        var inserts = [];
        var sql = "Insert into `account_permission`(`account_id`, `function_id`, `permission_id`) VALUES ";
        var sqlmid = " (?,?,?),";
        for(const per of permis.permission){
            inserts.push(userid, permis.function_id, per);
            sql+=sqlmid;
        }
        sql = sql.substring(0, sql.length - 1);
        return db.execute(sql,inserts)
    }

};
