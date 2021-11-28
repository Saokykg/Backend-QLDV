var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const share = require('../share')
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
var utilsAcc = require('../Utils/utilsAccount');
const { register } = require('../Utils/utilsAccount');
const { encode } = require('../share');
const permission = require('../middleware/permission');
// middleware for checking access token
// router.use(utils.authenticateToken);

router.use(permission.read);

router.get('/document', async (req, res, next) => {
    try {
        console.log("IN");
        var Root = path.join('Document')
        var filename =[];
        fs.readdir(Root, (err, files) => {
            if (err){ 
                res.json({"res":"No folder"});
                return;
            }
            if (files != undefined)
                for (const file of files){
                    var tmp = {};
                    tmp['name'] = file;
                    tmp['id'] = file;
                    filename.push(tmp);
                }
                // console.log(filename);
                res.json(filename);
            });
    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});


router.post('/document', async (req, res, next) => {
    try {
        var Root = path.join('Document')
        var filename = req.body.filename;
        var location = path.join(__dirname,'../Document', filename);
        res.sendFile(location);

    } catch (err) {
        await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.sendStatus(400);
    }
});


module.exports = router;


