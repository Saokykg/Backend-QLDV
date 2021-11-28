require('dotenv').config();
const crypto = require('crypto');
// const { encode } = require('querystring');
const nodemailer = require('nodemailer');

let iv = Buffer.from(process.env.iv,'hex');

const transpoter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user:"jktestmailer@gmail.com",
        pass:"brurpzgkjkvubqcf"
    }
});

// console.log(iv);
module.exports = class Share{
    
    static encode(value){
        if (typeof(value)=='number') return value;
        if (value == null || value == undefined ) return null;
        if (value == '') return value;
        var mykey = crypto.createCipheriv('aes-256-cbc', process.env.secretKey, iv);
        var mystr = mykey.update(value, 'utf8', 'hex');
        mystr += mykey.final('hex');
        // console.log(mystr);
        return mystr;
    }

    static decode(value){
        if (typeof(value)=='number') return value;
            if (typeof value == 'string' && value != '' && value.length % 32 == 0){
            if (value == null || value == undefined || value == '') 
                return null;
            var mykey = crypto.createDecipheriv('aes-256-cbc', process.env.secretKey, iv);
            var mystr = mykey.update(value, 'hex', 'utf8');
            mystr += mykey.final('utf8');
            return mystr;
        }
        return value;
    }

    static decodeArray(obj){
        var result = obj;
        // console.log(result);
        for (const o of result){
            Object.keys(o).forEach( async (key) => {
                        o[key] = await this.decode(o[key]);
            });
        }
        return result;
    }

    static getTable(tablename, tableSelect, tableSelect2){
         var sql = "select ROW_NUMBER() OVER (ORDER BY tablemain.`id`) AS `STT`, tablemain.`id`,`Số lý lịch`, `Số thẻ đảng`, `Họ và tên đệm`, `Tên`,`Ngày sinh`,`Giới tính`,   null as `Ngày vào Đảng`, "+
         " coalesce(`Ngày vào Đảng (dự bị)`,'') as db, " +
         "  coalesce(`Ngày vào Đảng (chính thức)`,'') as ct , `Nghề nghiệp`, `Chi bộ`, coalesce(tableChucVu.`Đơn vị công tác`,'') as `Đơn vị`, null as `Chức vụ`, "+
         "  `Chức danh`, `Học vấn`, `Học vị`, `Lý luận chính trị`,`Quê quán`, `Điện thoại`, `Email`, `Dân tộc`, `Tôn giáo`," + 
         " `Nơi ở`,`Tốt nghiệp` , `Đối tượng`,`Trạng thái`, coalesce(tablemain.d,'') as d, "+ 
         " coalesce(wardqq,'') as wq, coalesce(provinceqq,'') as pq, coalesce(districtqq,'') as dq, coalesce(wardno,'') as wo, "+
         " coalesce(provinceno,'') as po, coalesce(districtno,'') as do  ," + 
         "  coalesce(tableChucVu.`Chức vụ Đảng`,'') as `Chức vụ Đảng`, coalesce(tableChucVu.`Chức vụ Chính quyền`,'') as `Chức vụ Chính quyền` , coalesce(tableChucVu.`Chức vụ Đoàn thể`,'') as `Chức vụ Đoàn thể`, coalesce(`Kiêm nhiệm`, '') as `Kiêm nhiệm` " +
            tableSelect2 + 
         " from " + 
         "(select stb.`id`, `Mã`, `Số lý lịch`, `Số thẻ đảng`,`Họ và tên đệm`, `Tên`, " +
        " DATE_FORMAT(`Ngày sinh`,'%d-%m-%Y') as `Ngày sinh`,`Giới tính`, `chibo` as `Chi bộ`, " +
        "  dtc.`Dân tộc`, tg.`Tôn giáo`, cd.`type` as `Chức danh`, " +
        "  `Học vấn`, `Học vị`, ct.`type` as`Lý luận chính trị`,  `Quê quán` , `Địa chỉ` as d,`Nơi ở` ,`Tốt nghiệp`,  " +
        "  `Nghề nghiệp` , dt.`type` as `Đối tượng`, lstt.`idtt` as `Trạng thái`, null as `Nơi gia nhập`  " + tableSelect +
        "  from  lichsu_sinhoat sh, lichsu_llct ct, lichsu_chucdanh cd, lichsu_doituong dt, hoso h, lichsu_trangthai lstt , " + tablename + " stb, soquyetdinh sqd, trangthai tt, dantoc dtc, tongiao tg " +
        " where h.`id` = sh.`idhs` and h.`id` = ct.`idhs`  and h.`id` = cd.`idhs`  and h.`id` = dt.`idhs`  and h.`id` = lstt.`idhs` and sqd.`id` = stb.`Số quyết định` "+
        " and stb.`id hồ sơ` = h.`id` and tt.`id`= lstt.`idtt` and h.`Dân tộc` = dtc.`id` and h.`Tôn giáo` = tg.`id` " +
        " and  ((sqd.`Ngày ban hành` between cd.`start` and cd.`end`) or (cd.`start` <= sqd.`Ngày ban hành` and isnull(cd.`end`))) " +
        " and  ((sqd.`Ngày ban hành` between sh.`start` and sh.`end`) or (sh.`start` <= sqd.`Ngày ban hành` and isnull(sh.`end`))) " +
        " and  ((sqd.`Ngày ban hành` between dt.`start` and dt.`end`) or (dt.`start` <= sqd.`Ngày ban hành` and isnull(dt.`end`)))  " +
        " and (h.`id` , lstt.`start`) IN " +
        " (select idhs, max(`start`)  " +
        " from lichsu_trangthai ls, " + tablename + " stb, soquyetdinh sqd  " +
        " where stb.`id hồ sơ` = ls.idhs and sqd.`id` = stb.`Số quyết định` and ls.`start` < sqd.`Ngày ban hành` group by idhs)  " +
        " and  (h.`id`, ct.`start`) IN " +
        " (select idhs, max(`start`)  " +
        " from lichsu_llct ls, " + tablename + " stb, soquyetdinh sqd  " +
        " where stb.`id hồ sơ` = ls.idhs and sqd.`id` = stb.`Số quyết định` and ls.`start` < sqd.`Ngày ban hành` group by idhs)) as tablemain " +
        " left join " +
        "  (SELECT hscv.`id hồ sơ`, dv.`Tên` as `Đơn vị công tác`,  cv1.`Tên` as `Chức vụ Đảng`, cv2.`Tên` as `Chức vụ Chính quyền` , cv3.`Tên`  as`Chức vụ Đoàn thể` , hscv.`Kiêm nhiệm` " +        
        "  FROM hoso_chucvu AS hscv " + 
        "  JOIN chucvu AS cv1 ON hscv.`Chức vụ Đảng` = cv1.`id` " +
        "  JOIN chucvu AS cv2 ON hscv.`Chức vụ chính quyền` = cv2.`id` " +
        "  JOIN chucvu AS cv3 ON hscv.`Chức vụ Đoàn thể` = cv3.`id` " +
        "  JOIN donvi  as dv  ON hscv.`id đơn vị`  = dv.`id` order by hscv.`id hồ sơ` ) as tableChucVu " +
        "  ON tablemain.`id` = tableChucVu.`id hồ sơ` " +
        "   left  join    " +
        "   (select DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày vào Đảng (dự bị)` , id  " +
        "   from gianhapdang  " +
        "   where `Loại` = '"+ this.encode('Dự bị') +"') as t2   " +
        "   on tablemain.id = t2.id    left   join   " +
        "   (select DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày vào Đảng (chính thức)` , id  " +
        "   from gianhapdang  " +
        "   where `Loại` = '"+ this.encode('Chính thức') +"') as t3 " +
        "   on t3.`id` = t2.`id`    " +
        "   left join     " +
        "   (select ttll.`Địa chỉ` as `Điện thoại`, hs.`id`    " +
        "   from hoso hs, thongtinlienlac ttll    " +
        "   where hs.`id` = ttll.`id hồ sơ` and `Loại`=  '"+ this.encode('sdt') +"' and `level` = '"+ this.encode('Chính') +"') as tsdt " +
        "   on tablemain.`id` = tsdt.`id`    " +
        "   left join     " +
        "   (select ttll.`Địa chỉ` as `Email`, hs.`id`     " +
        "   from hoso hs, thongtinlienlac ttll     " +
        "   where hs.`id` =  " +
        "  ttll.`id hồ sơ` and `Loại`= '"+ this.encode('email') +"' and `level` = '"+ this.encode('Chính') +"') as temail " +
        "  on tablemain.`id` = temail.`id`    " +
        "  left join    " +
        "  (select p.name as provinceqq, d.name as districtqq, w.name as wardqq, w.`id`   " +
        "  from province p, district d, ward w    " +
        "  where p.id = d.province_id and d.id = w.district_id) as qq    " +
        "  on tablemain.`Quê quán`= qq.`id`   " +
        "  left join    " +
        "  (select p.name as provinceno, d.name as districtno, w.name as wardno, w.`id`    " +
        "  from province p, district d, ward w    " +
        "  where p.id = d.province_id and d.id = w.district_id) as noio    " +
        "  on tablemain.`Nơi ở`= noio.`id` " +
        " order by tablemain.`id`";
        return sql;
    }

    static async getTableNow(tablename, select, select2){
        
        var sql = "select ROW_NUMBER() OVER (ORDER BY tablemain.`id`) AS `STT`, tablemain.`id`,`Số lý lịch`, `Số thẻ đảng`, `Họ và tên đệm`, `Tên`,`Ngày sinh`,`Giới tính`,   null as `Ngày vào Đảng`, "+
         " coalesce(`Ngày vào Đảng (dự bị)`,'') as db, " +
         "  coalesce(`Ngày vào Đảng (chính thức)`,'') as ct , `Nghề nghiệp`, `Chi bộ`, coalesce(tableChucVu.`Đơn vị công tác`,'') as `Đơn vị`, null as `Chức vụ`, "+
         "  `Chức danh`, `Học vấn`, `Học vị`, `Lý luận chính trị`,`Quê quán`, `Điện thoại`, `Email`, `Dân tộc`, `Tôn giáo`," + 
         " `Nơi ở`,`Tốt nghiệp` , `Đối tượng`,`Trạng thái`, coalesce(tablemain.d,'') as d, "+ 
         " coalesce(wardqq,'') as wq, coalesce(provinceqq,'') as pq, coalesce(districtqq,'') as dq, coalesce(wardno,'') as wo, "+
         " coalesce(provinceno,'') as po, coalesce(districtno,'') as do  ," + 
         "  coalesce(tableChucVu.`Chức vụ Đảng`,'') as `Chức vụ Đảng`, coalesce(tableChucVu.`Chức vụ Chính quyền`,'') as `Chức vụ Chính quyền` ,"+
         " coalesce(tableChucVu.`Chức vụ Đoàn thể`,'') as `Chức vụ Đoàn thể`, coalesce(`Kiêm nhiệm`, '') as `Kiêm nhiệm` " + select2 +
         " from " + 
         "(select stb.`id`, `Mã`, `Số lý lịch`, `Số thẻ đảng`,`Họ và tên đệm`, `Tên`, " +
        " DATE_FORMAT(`Ngày sinh`,'%d-%m-%Y') as `Ngày sinh`,`Giới tính`, `Tên chi bộ` as `Chi bộ`, " +
        "  dtc.`Dân tộc`, tg.`Tôn giáo`, cd.`type` as `Chức danh`, " +
        "  `Học vấn`, `Học vị`, ct.`type` as`Lý luận chính trị`,  `Quê quán` , `Địa chỉ` as d,`Nơi ở` ,`Tốt nghiệp`,  " +
        "  `Nghề nghiệp` , dt.`type` as `Đối tượng`, tt.`Trạng thái` as `Trạng thái`, null as `Nơi gia nhập`  "  + select +
        "  from  lichsu_sinhoat sh, lichsu_llct ct, lichsu_chucdanh cd, lichsu_doituong dt, hoso h, chibo cb, lichsu_trangthai lstt , trangthai tt, dantoc dtc, tongiao tg , " + tablename + " stb  " +
        " where h.`id` = sh.`idhs` and h.`id` = ct.`idhs`  and h.`id` = cd.`idhs`  and h.`id` = dt.`idhs` and cb.`id` = sh.`chibo`  and h.`id` = lstt.`idhs` and stb.`id hồ sơ` = h.`id`  "+
        " and  tt.`id`= lstt.`idtt` and h.`Dân tộc` = dtc.`id` and h.`Tôn giáo` = tg.`id` " +
        " and  (h.`id`, sh.`start`) IN  (select idhs, max(`start`) from lichsu_sinhoat group by idhs) " + 
        " and  (h.`id`, cd.`start`) IN  (select idhs, max(`start`) from lichsu_chucdanh group by idhs)  " + 
        " and  (h.`id`, dt.`start`) IN  (select idhs, max(`start`) from lichsu_doituong group by idhs) " + 
        " and  (h.`id`, ct.`start`) IN   (select idhs, max(`start`) from lichsu_llct group by idhs) " + 
        " and  (h.`id`, lstt.`start`) IN (select idhs, max(`start`) from lichsu_trangthai group by idhs) ) as tablemain " +
        " left join " +
        "  (SELECT hscv.`id hồ sơ`, dv.`Tên` as `Đơn vị công tác`,  cv1.`Tên` as `Chức vụ Đảng`, cv2.`Tên` as `Chức vụ Chính quyền` , cv3.`Tên`  as`Chức vụ Đoàn thể` , hscv.`Kiêm nhiệm` " +        
        "  FROM hoso_chucvu AS hscv " + 
        "  JOIN chucvu AS cv1 ON hscv.`Chức vụ Đảng` = cv1.`id` " +
        "  JOIN chucvu AS cv2 ON hscv.`Chức vụ chính quyền` = cv2.`id` " +
        "  JOIN chucvu AS cv3 ON hscv.`Chức vụ Đoàn thể` = cv3.`id` " +
        "  JOIN donvi  as dv  ON hscv.`id đơn vị`  = dv.`id` order by hscv.`id hồ sơ` ) as tableChucVu " +
        "  ON tablemain.`id` = tableChucVu.`id hồ sơ` " +
        "   left  join    " +
        "   (select DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày vào Đảng (dự bị)` , id  " +
        "   from gianhapdang  " +
        "   where `Loại` = '"+ this.encode('Dự bị') +"') as t2   " +
        "   on tablemain.id = t2.id    left   join   " +
        "   (select DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày vào Đảng (chính thức)` , id  " +
        "   from gianhapdang  " +
        "   where `Loại` = '"+ this.encode('Chính thức') +"') as t3 " +
        "   on t3.`id` = t2.`id`    " +
        "   left join     " +
        "   (select ttll.`Địa chỉ` as `Điện thoại`, hs.`id`    " +
        "   from hoso hs, thongtinlienlac ttll    " +
        "   where hs.`id` = ttll.`id hồ sơ` and `Loại`=  '"+ this.encode('sdt') +"' and `level` = '"+ this.encode('Chính') +"') as tsdt " +
        "   on tablemain.`id` = tsdt.`id`    " +
        "   left join     " +
        "   (select ttll.`Địa chỉ` as `Email`, hs.`id`     " +
        "   from hoso hs, thongtinlienlac ttll     " +
        "   where hs.`id` =  " +
        "  ttll.`id hồ sơ` and `Loại`= '"+ this.encode('email') +"' and `level` = '"+ this.encode('Chính') +"') as temail " +
        "  on tablemain.`id` = temail.`id`    " +
        "  left join    " +
        "  (select p.name as provinceqq, d.name as districtqq, w.name as wardqq, w.`id`   " +
        "  from province p, district d, ward w    " +
        "  where p.id = d.province_id and d.id = w.district_id) as qq    " +
        "  on tablemain.`Quê quán`= qq.`id`   " +
        "  left join    " +
        "  (select p.name as provinceno, d.name as districtno, w.name as wardno, w.`id`    " +
        "  from province p, district d, ward w    " +
        "  where p.id = d.province_id and d.id = w.district_id) as noio    " +
        "  on tablemain.`Nơi ở`= noio.`id` " +
        " order by tablemain.`id`";
        // console.log(sql);
        return sql;
    }

    static async fillTable(rs){
        for (const hs of rs){
            var tmp = [
                {"Dự bị"      : hs.db},
                {"Chính thức" : hs.ct},
            ]
            hs[`Ngày vào Đảng`] = tmp;
            var tmp1 =[
                {"Phường/Xã"  : hs.wq},
                {"Quận/Huyện" : hs.dq},
                {"Tỉnh/Thành" : hs.pq}
            ]
            hs[`Quê quán`] = tmp1;
            var tmp =[
                {"Địa chỉ"    : hs[`d`]},
                {"Phường/Xã"  : hs.wo},
                {"Quận/Huyện" : hs.do},
                {"Tỉnh/Thành" : hs.po}
            ]
            hs[`Nơi ở`] = tmp;
            var tmp =[
                {"Đảng" : hs[`Đảng`]},
                {"Chính quyền" : hs[`Chính quyền`]},
                {"Đoàn thể" : hs[`Đoàn thể`]},
                {"Kiêm nhiệm" : hs[`Kiêm nhiệm`]}
            ];
            // console.log(rs[i]);
            hs[`Chức vụ`] = tmp;
            hs[`db`] = undefined;
            hs[`ct`] = undefined;
            hs[`po`] = undefined;
            hs[`pq`] = undefined;
            hs[`dp`] = undefined;
            hs[`dq`] = undefined;
            hs[`wo`] = undefined;
            hs[`wq`] = undefined;
            hs[`d`]  = undefined;
            hs[`do`]  = undefined;
            hs[`Đảng`] = undefined;
            hs[`Chính quyền`] = undefined;
            hs[`Đoàn thể`] = undefined;
            hs[`Kiêm nhiệm`] = undefined;
        }
        // console.log(rs);
        return rs;
    }

    static async mailer(req, res, next, code, email){
        
        var mailOptions = {
            from: "jktestmailer@gmail.com",
            to: email, 
            subject: "Mã đổi mật khẩu, phần mềm quản lý Đảng viên",
            text: "Nhập mã sau đây để xác nhận: " + code
        }
        try {
            await transpoter.sendMail(mailOptions, function (err, info){
                if (err){
                    console.log(err);
                    return;
                }
                console.log(info.response);
            });  
        } catch (error) {
            res.json({"error":"mailer error"})
        }  
    }

    static async errorMailer(req, res, next, mess){
        next();
        return;
        var mailOptions = {
            from: "jktestmailer@gmail.com",
            to: "1851050051hoa@ou.edu.vn", 
            subject: "Lỗi phần mềm quản lý Đảng viên",
            text: mess
        }
        try {
            await transpoter.sendMail(mailOptions, function (err, info){
                if (err){
                    console.log(err);
                    return;
                }
                console.log(info.response);
                return res.json(info.response);
            });  
        } catch (error) {
            res.json({"error":"mailer error"})
        }  
    }

    static async notificationMail(mess, email){
        var mailOptions = {
            from: "jktestmailer@gmail.com",
            subject: "Thông báo từ phần mềm quản lý Đảng viên",
            text: mess,
            html: mess
        }
        mailOptions.to = email;
        try {
            await transpoter.sendMail(mailOptions, function (err, info){
                if (err){
                    console.log(err);
                    return;
                }
                console.log(info.response);
                return ;
            });  
        } catch (error) {
            console.log(error);
            return;
        }  
    }

}
