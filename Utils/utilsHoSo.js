var mysql = require('mysql');
var utilsHoSo_ChucVu = require('./utilsHoSo_ChucVu');
var db = require('./connection');
const { insert } = require('./utilsHoso_HuyHieu');
const share = require('../share');
const { encode } = require('../share');
const { getById } = require('./utilsAccount');
const { listenerCount } = require('./connection');


var sqlHoSo = "select lstt.`idtt` as `Trạng thái`, null as `Nơi gia nhập`, `Mã`, h.`id`,`Số lý lịch`, `Số thẻ đảng`,`Họ và tên đệm`, `Tên`, " + 
            " DATE_FORMAT(`Ngày sinh`,'%d-%m-%Y') as `Ngày sinh`,`Giới tính`,  null as `Đơn vị công tác`, `chibo` as `Chi bộ`, " + 
            " null as `Chức vụ Đảng`, null as `Chức vụ Chính quyền`, null as `Chức vụ Đoàn thể` ,`Nơi ở` ,`Quê quán`, `Tôn giáo`, `Dân tộc`, " +  
            " cd.`type` as `Chức danh`, `Học vấn`, `Học vị`, ct.`type` as `Lý luận chính trị` , `Địa chỉ` as d, " + 
            " `Tốt nghiệp`, `Ghi chú`,  `Nghề nghiệp` , dt.`type` as `Đối tượng`, `Mã`, `chibo` as `Chi bộ`  " + 
            " from  lichsu_sinhoat sh, lichsu_llct ct, lichsu_chucdanh cd, lichsu_doituong dt, hoso h, lichsu_trangthai lstt  " +  
            " where h.`id` = sh.`idhs` and h.`id` = ct.`idhs`  and h.`id` = cd.`idhs`  and h.`id` = dt.`idhs`  and h.`id` = lstt.`idhs`  " + 
            " and  (h.`id`, sh.`start`) IN  (select idhs, max(`start`) from lichsu_sinhoat group by idhs) " + 
            " and  (h.`id`, cd.`start`) IN  (select idhs, max(`start`) from lichsu_chucdanh group by idhs)  " + 
            " and  (h.`id`, dt.`start`) IN  (select idhs, max(`start`) from lichsu_doituong group by idhs) " + 
            " and  (h.`id`, ct.`start`) IN   (select idhs, max(`start`) from lichsu_llct group by idhs) " + 
            " and  (h.`id`, lstt.`start`) IN (select idhs, max(`start`) from lichsu_trangthai group by idhs) ";

module.exports = class utilHoSo{
    constructor(id, sothe, hoTenDem, ten, totnghiep, queQuan,
        gioiTinh, tonGiao, danToc, hocVan, hocVi, ngaySinh, nghe, diachi, 
        noiO, soLyLich, ghiChu, ma, chucDanh, llct, chiBo, doiTuong, active, trangthai){
            this.id = id;
            this.soThe    = share.encode(sothe);
            this.hoTenDem = share.encode(hoTenDem);
            this.ten = share.encode(ten);
            this.doiTuong = share.encode(doiTuong);
            this.totnghiep= share.encode(totnghiep);
            this.chiBo    = chiBo;
            this.queQuan  = queQuan //share.encode(queQuan);
            this.gioiTinh = share.encode(gioiTinh);
            this.tonGiao  = tonGiao;
            this.danToc   = danToc;
            this.chucDanh = share.encode(chucDanh);
            this.hocVan   = share.encode(hocVan);
            this.hocVi    = share.encode(hocVi);
            this.ngaySinh = ngaySinh;
            this.nghe     = share.encode(nghe);
            this.diachi   = share.encode(diachi);
            this.noiO     = noiO //share.encode(noiO);
            this.soLyLich = share.encode(soLyLich);
            this.llct     = share.encode(llct);
            this.ghiChu   = share.encode(ghiChu);
            this.trangthai= trangthai;
            this.ma = share.encode(ma);
            this.active = active;
        }
        
        static getAll(){
            var sql = "SELECT ROW_NUMBER() OVER (ORDER BY `id`) AS `STT`, hs.* FROM hosopure hs";
            return db.execute(sql);
        }

        static getListNoAccount(){
            var sql = "SELECT `id`, `Số thẻ đảng`, `Họ và tên đệm`, `Tên` from `hoso`  " +
            " Where `Active` = 1 and  `id` not in (select `hoso_id` from `account` where `active` = 1 and !isnull(`hoso_id`))";
            return db.execute(sql);
        }

        static getAllKhoang(dau, cuoi){
            var sql = "CALL hoso_view_khoang(?,?)";
            // console.log(mysql.format(sql,[dau, cuoi]));
            return db.execute(sql,[dau, cuoi]);
        }
        
        static getAllpure(){
            var sql = "CALL hoso(?);";
            // console.log(sql);
            var tmp = {"test": "this is test"};
            console.log(mysql.format(sql,[tmp]));
            return db.execute(sql,[tmp]);
        }
        
        static getAllactive(){
            var sql = sqlHoSo + " where  `active` = 1 order by h.`id`";
            return db.execute(sql);
        }

        static getByChiBo(id){
            var sql = "select id from hoso where `Chi bộ` = ?";
            return db.execute(sql,[id]);
        }

        static getByName(name){
            var sql = sqlHoSo + " where concat(h.`Họ và tên đệm`, ' ', h.`Tên`) like ? order by h.`Số thẻ đảng` ";
            return db.execute(sql,['%' + name + '%']);
        }

        static async getBySTD(std){
            std = await share.encode(std);
            var sql = "select id from hoso where `Số thẻ đảng` = ? ";
            return db.execute(sql,[std]);
        }

        static getById(id){
            var sql = "select * from hoso_view_with_id where id = ? ";
            return db.execute(sql,[id]);
        }

        static getByIdFull(id){
            var sql = "select * from hosopure where `id` = ? ";
            return db.execute(sql,[id]);
        }

        static async update(userId, hanhdong, oldInfo, info){ //info = class utilHoso
            
            // console.log(oldInfo['Mã'], info.ma);
            var sql =  "SELECT updateHoSo(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) as result";
            var check = 0;
            check = await findDifferent(oldInfo, info, check);
            
            // console.log(check);
            if (check == 23) return -1;
             var inserts = [userId, hanhdong, info.id, info.soThe, info.hoTenDem, info.ten, info.totnghiep, info.queQuan, info.gioiTinh, info.tonGiao, 
                info.danToc, info.hocVan, info.hocVi, info.ngaySinh, info.nghe, info.diachi, info.noiO, info.soLyLich, 
                info.ghiChu, info.ma, info.chucDanh, info.llct, info.chiBo, info.doiTuong, null, info.trangthai];
            
                console.log(mysql.format(sql,inserts));
                
            return db.execute(sql, inserts);
        }


        static insert(userId, ngay, info){

            var sql = "SELECT InsertHoSo(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) as result" ;
            if (info.totnghiep == null)
                info.totnghiep = 'Khác';
            var inserts = [userId, info.soThe, info.hoTenDem, info.ten, info.totnghiep, info.queQuan, info.gioiTinh, info.tonGiao, 
                info.danToc, info.hocVan, info.hocVi, info.ngaySinh, info.nghe, info.diachi, info.noiO, info.soLyLich, 
                info.ghiChu, info.ma, info.chucDanh, info.llct, info.chiBo, info.doiTuong, info.trangthai, ngay];
            // console.log(mysql.format(sql,inserts));
            return db.execute(sql, inserts);
        }

        static async active(userid, ids, act){
            var list=[];
            for (const id of ids){

                try {
                    await db.execute("select saveAction(?,'hoso','Xóa', ? ) as result",[userid, id]);
                    await db.execute("SELECT updateHoSo(?,'cập nhật',?,null,null,null,null,null,null,null,null,null,null, "+
                        "null,null,null,null,null,null,null,null,null,null,null,?,null) as result",[userid, id, act]);
                } catch (error) {
                    list.push(id);
                    console.log(error);
                }
            }
            return list;
        }

        static delete(id){
            var func = async(idhs)=>{
                var ex = await utilsHoSo_ChucVu.delete(idhs);
            }
            try {
                func(id);
            } catch (error) {
                console.log(error);
            }
            var sql = "DELETE FROM `hoso` WHERE `id` = ?";
            return db.execute(sql,[id]);
        }

        static async insertAction(userid, khoachinh){
            var sql = "select saveAction(?,'hoso','hệ thống thực thi',?) as result";
            var result = await db.execute(sql,[userid, khoachinh]);
            
            result[0][0].id =result[0][0].result ;
            
            return result;
        }

        static updateChuyenSH(idhs, chibo, userid, ngay, act_id){
            var sql = "call createNewLog('insert', 'Chuyển sinh hoạt', 'hoso', 'Chi bộ', ?, ?, ?, ?, ?);"
            // console.log(mysql.format(sql,[idhs, chibo, userid, ngay, act_id] ))
            return db.execute(sql,[idhs, chibo, userid, ngay, act_id])
        }

        static updateActive(idhs, active, userid, ngay, act_id){
            var sql = "call createNewLog('insert', 'Chuyển sinh hoạt', 'hoso', 'Active', ?, ?, ?, ?, ?);";
            return db.execute(sql,[idhs, active, userid, ngay, act_id]);
        }   

        static updateTrangThai(idhs, trangthai, userid, ngay, act_id){
            var sql = "call createNewLog('insert', 'Kỷ luật', 'hoso', 'Trạng thái', ?, ?, ?, ?, ?);";
            return db.execute(sql,[idhs, trangthai, userid, ngay, act_id]);
        }

        static deleteLogHoso(idhs, data, ngay, col){
            var sql = "delete from lichsu_chungthuc where `table` = 'hoso' and `column` = ? and "+
            " `row` = ? and `date` = STR_TO_DATE(?,'%d-%m-%Y') and `data` = ? ";
            return db.execute(sql,[col, idhs, ngay, data])
        }

        static updateNgayGiaNhap(idhs, ngay, old){
            var sql = "update `lichsu_chungthuc`  SET `date` = STR_TO_DATE(?,'%d-%m-%Y')  where `table` IN ('hoso','hoso_chucvu','gianhapdang','thongtinlienlac') "+
            " and `row` =? and `date` = STR_TO_DATE(?,'%d-%m-%Y')  ";
            return db.execute(sql,[ngay, idhs, old]);
        }

        static updateNewChibo(idhs){
            var sql = "update hoso Set `Chi bộ` = ( "+
                " select `data` from lichsu_chungthuc  "+
                " where `table` = 'hoso' and `column` = 'Chi bộ' and `row` = ? and (`row`, `date`) IN(  "+
                " select `row`, max(`date`) from lichsu_chungthuc where `table` = 'hoso' and `column` = 'Chi bộ' and `row` = ? "+
                " group by `row`)) where `id` = ? ";
            // console.log(mysql.format(sql,[idhs,idhs,idhs]));
            return db.execute(sql,[idhs,idhs,idhs]);
        }

        static updateNewTrangThai(idhs){
            var sql = "update hoso Set `Trạng thái` = ( "+
                " select `data` from lichsu_chungthuc  "+
                " where `table` = 'hoso' and `column` = 'Trạng thái' and `row` = ? and (`row`, `date`) IN(  "+
                " select `row`, max(`date`) from lichsu_chungthuc where `table` = 'hoso' and `column` = 'Trạng thái' and `row` = ? "+
                " group by `row`)) where `id` = ? ";
            // console.log(mysql.format(sql,[idhs,idhs,idhs]));
            return db.execute(sql,[idhs,idhs,idhs]);

        }

        static fixChuyenSH(idhs, chibo, userid, ngay){

        }


    
}

async function findDifferent(oldinfo, info){
    var check = 0;
    if (oldinfo[`Số thẻ đảng`]   == info.soThe)    {check++; info.soThe = null;}
    if (oldinfo[`Họ và tên đệm`] == info.hoTenDem) {check++; info.hoTenDem = null;}
    if (oldinfo[`Tên`]           == info.ten)      {check++; info.ten = null;}
    if (oldinfo[`Đối tượng`]     == info.doiTuong) {check++; info.doiTuong = null;}
    if (oldinfo[`Tốt nghiệp`]    == info.totnghiep){check++; info.totnghiep = null;}
    if (oldinfo[`Chi bộ`]        == info.chiBo)    {check++; info.chiBo = null;}
    if (oldinfo[`Quê quán`]      == info.queQuan)  {check++; info.queQuan = null;}
    if (oldinfo[`Giới tính`]     == info.gioiTinh) {check++; info.gioiTinh = null;}
    if (oldinfo[`Dân tộc`]       == info.danToc)   {check++; info.danToc = null;}
    if (oldinfo[`Tôn giáo`]      == info.tonGiao)  {check++; info.tonGiao = null;}
    if (oldinfo[`Chức danh`]     == info.chucDanh) {check++; info.chucDanh = null;}
    if (oldinfo[`Học vấn`]       == info.hocVan)   {check++; info.hocVan = null;}
    if (oldinfo[`Học vị`]        == info.hocVi)    {check++; info.hocVi = null;}
    if (oldinfo[`Ngày sinh`]     == info.ngaySinh) {check++; info.ngaySinh = null;}
    if (oldinfo[`Nghề nghiệp`]   == info.nghe)     {check++; info.nghe = null;}
    if (oldinfo[`d`]             == info.diachi)   {check++; info.diachi = null;}
    if (oldinfo[`Nơi ở`]         == info.noiO)     {check++; info.noiO = null;}
    if (oldinfo[`Số lý lịch`]    == info.soLyLich) {check++; info.soLyLich = null;}
    if (oldinfo[`Lý luận chính trị`] == info.llct) {check++; info.llct = null;}
    if (oldinfo[`Active`]        == info.active)   {check++; info.active = null;}
    if (oldinfo[`Ghi chú`]       == info.ghiChu)   {check++; info.ghiChu = null;}
    if (oldinfo[`Mã`]            == info.ma)       {check++; info.ma = null;}
    if (oldinfo[`Trạng thái`]    == info.trangthai){check++; info.trangthai = null;}
    return check;
}