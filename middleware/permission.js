const { response } = require('express');
const utilsAccount = require('../Utils/utilsAccount');
const utilsHoSo = require('../Utils/utilsHoSo');

module.exports = {
    admin: async function (req,res,next) {
        const authHeader = req.headers['authorization'];
        if (authHeader == undefined , authHeader == null){
            res.sendStatus(401);
            return;
        }
        const token = authHeader && authHeader.split(' ')[1];
        try {
            var tmp = await require('jsonwebtoken' ).decode(token);
        } catch (error) {
            res.sendStatus(401);
            return;
        }
        if (tmp == null){
            res.sendStatus(401);
            return;
        }
        req.userid = tmp.id;
        var checkadmin = await utilsAccount.getById(tmp.id);
        checkadmin = checkadmin[0][0];
        if (checkadmin.permission == 'admin'){
            next();
            return;
        }
    },
    read: function(req,res,next) {
        permission(req, res, next, ["view"]);
    },
    create: function(req,res,next) {
        permission(req, res, next, ["create"]);
    },
    edit: function(req,res,next) {
        permission(req, res, next, ["edit"]);
    },
    delete: function(req,res,next) {
        permission(req, res, next, ["delete"]);
    },
    authorize: function(req,res,next) {
        permission(req, res, next, ["edit", "create"]);
    }
} 

async function permission(req, res, next, per){
    var table = await reqFunct(req.baseUrl.toUpperCase());
    const authHeader = req.headers['authorization'];
    if (authHeader == undefined , authHeader == null){
        res.sendStatus(401);
        return;
    }
    const token = authHeader && authHeader.split(' ')[1];
    try {
        var tmp = await require('jsonwebtoken' ).decode(token);
    } catch (error) {
        res.sendStatus(401);
        return;
    }
    if (tmp == null){
        res.sendStatus(401);
        return;
    }
    req.userid = tmp.id;
    var checkadmin = await utilsAccount.getById(tmp.id);
    // console.log(table, tmp, checkadmin  );
    if (checkadmin[0].length == 0){
        res.sendStatus(400);
        return;
    }
    req.admin = false;
    checkadmin = checkadmin[0][0];
    if (checkadmin.permission == 'admin'){
        req.admin = true;
        next();
        return;
    }
    var user = await require('../Utils/utilsAccount').checkPer(tmp.id);
    user = user[0];
    if (user.length == 0){
        res.json({"res":"Người dùng không hợp lệ"});
    }
    else{
        //lay danh sach ho so trong tam quan ly
        if (checkadmin[`Chi bộ`] == null){
            res.sendStatus(400);
            return;
        }
        else{
            var idhslist = await utilsHoSo.getByChiBo(checkadmin[`Chi bộ`]);
            idhslist = idhslist[0];
            var arr = [];
            idhslist.forEach(id => arr.push(id.id));
            req.dshosoquanly = arr;
            console.log(req.dshosoquanly)
            req.chiboquanly = checkadmin[`Chi bộ`];
        }
        //kiem tra quyen
        var accept = false;
        user.forEach((permis) => {
            if (permis.name.toUpperCase() == table.toUpperCase()){
                // console.log(per);
                per.forEach((p) =>{
                    if(permis.permission.split(',').includes(p)){
                        // console.log(per, permis);
                        accept = true;
                        return;
                    }
                })
            }
        })
        if (accept)
            next();
        else
            return res.json({"error":"Người dùng không có quyền thực hiện chức năng này!!!"});
    }
}

function reqFunct(url){
    var funt = (url.substring(url.lastIndexOf('/') + 1 , url.length));
    switch (funt){
        case 'LIENLAC' : case 'GIANHAP' : case 'HOSOTRANGTHAI' : case 'DONVICHUCVU' :
            return 'HOSO';
        case 'QUYHOACH' : case 'DSQUYHOACH' :
            return 'QUYHOACH';
        case 'AUTH': case 'GROUPS': return 'USERS';
        default : 
            return funt;
    }
}