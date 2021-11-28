// var createError = require('http-errors');
var express = require('express');
var connection = require('./Utils/connection');
const fileUpload = require('express-fileupload');
const cors = require('cors');

// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

var indexRouter  = require('./routes/index');
var usersRouter  = require('./routes/users');
var loginRouter  = require('./routes/login');
var hoSoRouter   = require('./routes/hoSo');
var chiBoRouter  = require('./routes/chiBo');
var chucVuRouter = require('./routes/chucVu');
var ngoaiQuocRouter = require('./routes/ngoaiQuoc');
var kyLuatRouter = require('./routes/kyLuat');
var chuyenRouter = require('./routes/chuyenSH');
var thanhTichRouter = require('./routes/thanhTich');
var hoSoHuyHieuRouter = require('./routes/hoSo_HuyHieu');
var huyHieuRouter = require('./routes/huyHieu');
var importRouter = require('./routes/import');
var exportRouter = require('./routes/export');
var lienLacRouter = require(`./routes/lienLac`);
var giaNhapRouter= require(`./routes/giaNhap`);
var locRouter= require(`./routes/loc`);
var uploaderRouter = require('./routes/uploader');
var thongbaoRouter = require('./routes/thongbao');
var locationRouter = require('./routes/location');
var downloaderRouter = require('./routes/downloader');
var thongKeRouter = require('./routes/thongke');
var danhGiaRouter = require('./routes/danhgia');
var hoSoQuyHoachRouter = require('./routes/HoSo_QuyHoach');
var quyHoachRouter = require('./routes/quyHoach');
var donViRouter = require('./routes/donvi');
var donViChucVuRouter = require('./routes/donvi_chucvu');
var danTocRouter = require('./routes/danToc');
var tonGiaoRouter = require('./routes/tonGiao');
var trangThaiRouter = require('./routes/trangThai');
var hsTrangThaiRouter = require('./routes/HoSo_TrangThai');
var logRouter = require('./routes/log');
var mienShRouter = require('./routes/mienSinhHoat');
const permission = require('./middleware/permission');
const groupRouter = require('./routes/group');
const historyRouter = require('./routes/history');
// var serverRun = require('./serverRunTime');  
var app = express();

app.use(cors());
// app.use(fileUpload());
app.use(express.urlencoded({ extended: false,limit: '50mb' }));
app.use(express.json({limit: '50mb'}));
// var testRouter = require('./routes/test')
// app.use('/', testRouter);



app.use('/', indexRouter);
app.use('/auth',     loginRouter);
app.use('/users',    usersRouter);
app.use('/groups',   groupRouter);
app.use('/api/hoSo', hoSoRouter);
app.use('/api/chiBo',chiBoRouter);
app.use('/api/chucVu',    chucVuRouter);
app.use('/api/donVi',    donViRouter);
app.use('/api/donViChucVu',  donViChucVuRouter);
app.use('/api/ngoaiQuoc', ngoaiQuocRouter);
app.use('/api/thanhTich', thanhTichRouter);
app.use('/api/huyHieu',   hoSoHuyHieuRouter);
app.use('/api/huyHieuList', huyHieuRouter);
app.use('/api/kyLuat',      kyLuatRouter);
app.use('/api/chuyenSh',    chuyenRouter);
app.use('/api/lienLac',     lienLacRouter);
app.use('/api/giaNhap',giaNhapRouter);
app.use('/api/loc',locRouter);
app.use('/api/thongBao',thongbaoRouter)
app.use('/api/thongKe', thongKeRouter)
app.use('/api/danhGia',danhGiaRouter);
app.use('/api/quyHoach',quyHoachRouter);
app.use('/api/dsQuyHoach',hoSoQuyHoachRouter);
app.use('/api/danToc',danTocRouter);
app.use('/api/tonGiao',tonGiaoRouter);
app.use('/api/trangThai',trangThaiRouter);
app.use('/api/hoSoTrangThai',hsTrangThaiRouter);
app.use('/api/mienSH',mienShRouter);
app.use('/history', historyRouter);

// app.use('/log',logRouter);  
app.use('/api/import',importRouter);
// app.use('/export',exportRouter);
app.use('/location',locationRouter);
// app.use('/uploader',uploaderRouter);
app.use('/tailieu',downloaderRouter);

// serverRun;

app.get('*', function(req, res){
    res.status(404).json({"error": "page not found"});
});

app.listen(3000);

