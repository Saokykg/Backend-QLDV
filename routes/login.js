require('dotenv').config()

var express = require('express')
var jwt = require('jsonwebtoken')
const { refreshToken } = require('../Utils/utilsAccount')
var utilsAcc = require('../Utils/utilsAccount')
var token_duration = '600s'
const share = require('../share');
const utilsHoSo = require('../Utils/utilsHoSo')
const utilsGroup = require('../Utils/utilsGroup')
var router = express.Router();
const crypto = require('crypto');
const utils = require('../middleware/utils')
const { exit } = require('process')
const permission = require('../middleware/permission')
const { CONNREFUSED } = require('dns')

//basic
// 1. log in -> get access token + refreshtoken 
// 2. after a certain amount of time, the access token will expired -> you need to get a new access token by go to /auth/token and use ur refresh token
// 3. log out -> delete the reefresh token -> no more access token can be generate

//need to move to actual database for saving refreshtoken
let tokenArray = []

//get accesstoken and refreshtoken(token)

router.post('/login', async (req, res, next) => {
    const iname = req.body.username;
    var ipass = req.body.password;
    if (!iname || !ipass){
        res.sendStatus(400);
        return;
    }
    ipass = crypto.createHash('md5').update(ipass).digest("hex");
    // console.log(ipass)

    let user = {
        id : "",
        name: "",
        pass: ""
    }

    let getUser = async ()=>{
        let rs = await utilsAcc.getByUsername(iname); // username
        rs = rs[0][0];
        if(rs == null || rs.length == 0 ) {
            res.json({"error": "Sai mật khẩu hoặc tài khoản"});
            return;
        }
        if(rs.status === 5 || rs.active == 0)
            return res.json({"error": "Tài khoảng đang bị khóa"});
        
        user.id = rs.id;
        user.name = rs.username;
        user.pass = rs.password;
        if (user.pass === ipass){
            const accessToken  = generateToken(user);
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
            try {
                await utilsAcc.updateToken(refreshToken, user.id); // updatetoken
            } catch (error) {
                console.log(error);
            }
            // tokenArray.push(refreshToken);
            await utilsAcc.updateStatus(0, user.name);
            var permis = await utilsAcc.getPermisForLogin(rs.id);
            permis = permis[0];
            permis.forEach( (p) =>{
                p.permission = p.permission.split(',');
            })
            // console.log(permis);
            res.json({"accessToken": accessToken, "refreshToken": refreshToken,
             user:{
                 "username": rs.username,
                 "hoso_id":rs.hoso_id,
                 "user_type": rs.permission,
                 "email":rs.Email,
                 "MailService":rs.MailService,
                 "permission": permis
                }
            })
        } else {
            var status = rs.status + 1;
            await utilsAcc.updateStatus(status, rs.username);
            if (status === 5) 
                return res.json({"error": "Tài khoảng bị khóa"}); 
            res.json({"error": "Sai mật khẩu hoặc tài khoản"});
        }
    }
    getUser();

})

router.post('/activeCode', async (req,res, next) => {
    const iname = req.body.username;
    var random = crypto.randomBytes(3).toString('hex');
    var user = await utilsAcc.getByUsername(iname);
    user = user[0];
    if (user.length == 0)
        return res.json({"error":"user không tồn tại"});
    await utilsAcc.updateKey(random, iname);
    await share.mailer(req, res, next, random, user[0].Email);
    var tokenkey = await jwt.sign({username : iname, key : random}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '180s'});
    
    res.json({"token":tokenkey});
});

router.post('/checkCode', async (req,res, next) => {
    const code = req.body.code;
    const iname = req.body.username;
    var token = req.body.codeToken;
    var user = await utilsAcc.getByUsername(iname);
    user = user[0];
    if (user.length == 0)
        return res.json({"error":"user không tồn tại"});
    else{
        
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,  async (err) => {
            if(err) console.log(err);
            if(err) {
                // res.sendStatus(403);
                ans = {"error":"Hết hạn"};
                res.json(ans);
                return;
            }
            
            if (user[0].key == code){
                await utilsAcc.updateStatus(6, iname);
                await utilsAcc.updateKey(null, iname);
                var tokenkey = await jwt.sign({username : iname, key : code}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '180s'});
                res.json({"res":"Mã hợp lệ", "token": tokenkey });
            }
            else{
                res.json({"error":"Sai mã"});
            }
        })
    }
});

router.post('/recovery', async (req,res, next) => {
    const iname = req.body.username;
    var ipass = req.body.password;
    var token = req.body.recoveryToken;
    var user = await utilsAcc.getByUsername(iname);
    user = user[0];
    if (user.length == 0)
        return res.json({"error":"user không tồn tại"});
    else{
            var ans;
            
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,  async (err) => {
            if(err) console.log(err);
            if(err) {
                // res.sendStatus(403);
                ans = {"error":"Hết hạn"};
                res.json(ans);
                return;
            }
            
            ipass = crypto.createHash('md5').update(ipass).digest("hex");
            await utilsAcc.updatePass(user[0].id, ipass)
            await utilsAcc.updateStatus(0, iname);
            ans = {"res":"Thành công"};
            res.json(ans);
        })
    }
});

//refresh token checking => generate new token for user
router.post('/token', async (req,res, next) => {
    const refreshToken = req.body.token;
    // console.log(USER);
    if(refreshToken == null) {
        res.sendStatus(401);
        return;
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if(err) return res.sendStatus(403);
        const accessToken = generateToken({id: user.id, name: user.name, pass: user.pass});  // user bao gồm cả id
        var tmp = jwt.decode(refreshToken);
        var rs = await require('../Utils/utilsAccount').getByUsername(tmp.name);
        rs = rs[0][0];
        if (!rs){
            res.sendStatus(400);
            return;
        }
        var permis = await utilsAcc.getPermisForLogin(user.id);
        permis = permis[0];
        permis.forEach( (p) =>{
            p.permission = p.permission.split(',');
        })

        res.json({accessToken: accessToken, 
            user :{
                    "username": rs.username,
                    "hoso_id":rs.hoso_id,
                    "user_type": rs.permission,
                    "email":rs.Email,
                    "MailService":rs.MailService,
                    "permission": permis
                }
            });
    });
})

router.delete('/logout', (req, res) => {
    // console.log("TETS");
    let delToken = () => {
        return new Promise((resolve, reject) =>{
            jwt.verify(req.body.token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => { 
                if(err) {
                    reject(err);
                    res.send(err);
                }
                let data = await utilsAcc.updateToken(null, user.id);
                if(data[0].changedRows > 0) {
                    res.json({"res" : "Deleted successful"});
                } else {
                    res.json({"res" : "Token doesn't exist"});
                }
            })
        });
    }
    let rs = async () => {
        try {
            let rsDel = await delToken();
            res.send(rsDel);
        } catch (error) {
            console.log(error);
        }
    }
    rs();
})

router.post('/register', permission.authorize, async (req,res, next) =>{
    try {
        var user = req.body.user;
        console.log(user);
        if (user.id && user.group){
            var hs = await utilsHoSo.getByIdFull(user.id);
            var gr = await utilsGroup.getGroupId(user.group);

            gr = await share.decodeArray(gr[0]);
            hs = await share.decodeArray(hs[0]);
            
            if (hs.length == 1 && gr.length == 1){
                hs = hs[0];
                var flag = await utilsAcc.getByidhs(user.id);
                console.log(flag[0]);
                if (flag[0].length == 0){
                    //chua co tai khoang
                    if (hs[`Email`] == null){
                        res.json({
                            "status":"fail",
                            "messenger":"Không tạo được Tài khoản do thiếu thông tin email hồ sơ thành công"
                        })
                        return;
                    }
                    var password = crypto.createHash('md5').update(hs[`Số thẻ đảng`]).digest("hex");
                    var email = hs[`Email`];
                    var account = new utilsAcc(null, hs[`Số thẻ đảng`], password, email, 0, null,
                                0, user.id);
                    var rs = await utilsAcc.register(account);
                    rs = rs[0].insertId;
                    await utilsGroup.addUserGroup(user.group, rs);
                    res.statusCode = 201;
                    res.json({
                        "status":"created",
                        "user":{
                            "username":hs[`Số thẻ đảng`],
                            "email" : email,
                            "group" : gr[0][`name`]
                        },
                        "messenger":"Tài khoản được tạo thành công"
                    })
                    return;
                }else{
                    if(flag[0][0][`active`] == 0){
                        await utilsAcc.active(flag[0][0].id, 1);
                        res.json({
                            "status":"activated",
                            "user":{
                                "username" : flag[0][0]['username'],
                                "email" : flag[0][0]['Email'],
                                "group" : flag[0][0]['name']
                            },
                            "messenger":"Tài khoản active thành công"
                        })
                        return;
                    }
                    else{
                        res.json({
                            "status":"existed",
                            "user":{
                                "username" : flag[0][0]['username'],
                                "email" : flag[0][0]['Email'],
                                "group" : flag[0][0]['name']
                            },
                            "messenger":"Tài khoản đã tồn tại"
                        })
                        return;

                    }
                }
            }
        }
        res.sendStatus(400  );
        return;
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});
  
router.put('/update', async (req,res, next) =>{
    const username = req.body.user;
    const mailService = req.body.mailService;
    const email = req.body.email;
    var oldPass = req.body.oldPass;
    var newPass = req.body.newPass;
    const authHeader = req.headers['authorization'];
    if (authHeader == undefined || authHeader == null){
        res.sendStatus(401);
        return;
    }
    const token = authHeader && authHeader.split(' ')[1];
    var tmp = jwt.decode(token);
  
    var user = await utilsAcc.getById(tmp.id);
    user = user[0][0];
    console.log(user);

    if (email == ''|undefined) email = null;
    if (newPass == ''|undefined)
      newPass == null;
    else
      newPass= crypto.createHash('md5').update(newPass).digest("hex");
  
    oldPass= crypto.createHash('md5').update(oldPass).digest("hex");
    
    if (user.password !== oldPass || tmp.name !== user.username){
      res.json({"error" : "Mật khẩu hoặc tài khoản không hợp lệ !!!"})
      return;
    }
    // console.log(newPass, email)
    var newUser = new utilsAcc(tmp.id, user.username, newPass, email, null, null, user.mailService, null);
    var rs = await utilsAcc.update(newUser);
    var u ={
        id : newUser.id,
        name: newUser.username,
        pass: newUser.password
    }
    if (newPass != null){
        const accessToken  = generateToken(u);
        const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);
        try {
            let rs = await utilsAcc.updateToken(refreshToken, u.id); // updatetoken
        } catch (error) {
            console.log(error);
        }
        // tokenArray.push(refreshToken);
        
        var permis = await utilsAcc.getPermisForLogin(user.id);
        permis = permis[0];
        permis.forEach( (p) =>{
            p.permission = p.permission.split(',');
        })

        res.json({"accessToken": accessToken, "refreshToken": refreshToken,
            user:{
                "username": newUser.username,
                "hoso_id":rs.hoso_id,
                "user_type": user.permission,
                "email": newUser.email,
                "MailService":rs.MailService,
                "permission": permis}
        });
        return;
    }
    // res.json(rs[0]);
})

function generateToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: token_duration});
}

module.exports = router;