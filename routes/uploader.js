var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { resolveSoa } = require('dns');
const jwt = require('jsonwebtoken');
const utilsAcc = require('../Utils/utilsAccount');
const share = require('../share');
const permission = require('../middleware/permission');
//middleware for checking access token
router.use(permission.create);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'upload/')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`)
    }
  })
  
const upload = multer({ storage: storage });


router.post('/multifile', upload.array('files'), async (req, res, next) => {
    // res.send("test");
    try {
      const files = req.files;
      console.log(files);
      var folder = req.body.folder;
      var name = req.body.name;
      // console.log(files);
      name = await share.encode(name);
      if (!files) {
        const error = new Error('No File');
        error.httpStatusCode = 400;
        return next(error);
      }
      var loi ="";
      for (const file of files){
        var extra = path.extname(file.originalname);
        var savelocation = path.join('Storage', name, folder, file.originalname);
        if (fs.existsSync(savelocation))
          loi += "Trùng tên file tại thư mục: "+ folder + " tên file: " + file.originalname + "; ";
        else
          fs.rename('upload/' + file.originalname, savelocation, function (err) {
              if (err) {
                  return console.error(err);
              }
          });
      }
      if (loi != ""){
        res.json({"error":loi});
      }
      else
        res.send({"res": "success"});
    } catch (err) {
      await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/singleFile', upload.single('file'), async (req, res, next) => {
    try {
      const file = req.file;
      // console.log(file);
      var name = req.body.name;
      var folder = req.body.folder;
      // console.log(name);
      name = await share.encode(name);
      // console.log(file);
      if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400
        return next(error);
      }
      var savelocation = path.join('Storage', name, folder, file.originalname);
      fs.rename('upload/' + file.originalname, savelocation, function (err) {
        if (err) {
            return console.error(err);
        }
        res.json({"res": "Thành công"});
      });
    } catch (err) {
      await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.post('/singleImage', upload.single('file'), async (req, res, next) => {
    try {
      const file = req.file;
      console.log("filessadsad", file);
      var name = req.body.name;
      console.log(name);
      name = await share.encode(name);
      // console.log(file);
      if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400
        res.send(error);
      }
        var extra = path.extname(file.originalname);
        var savelocation = path.join('Storage', name,'images'+ extra);
            fs.rename('upload/' + file.originalname, savelocation, function (err) {
              if (err) {
                  return console.error(err);
              }
              res.send(file);
            });
          // })
    } catch (err) {
      await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
})

router.delete('/delete/:name/:folder/:file',async (req, res, next) => {
    try {
      var name = req.params.name;
      var folder = req.params.folder;
      var file = req.params.file;
      name = await share.encode(name);
      var location =path.join('Storage', name, folder, file);
      fs.unlinkSync(location);
      res.send({"res": "success"})
    } catch (err) {
      await share.errorMailer(req, res, next, err.stack.toString());
        console.log(err);
        res.json(err);
    }
});
module.exports = router;