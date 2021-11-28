module.exports = {
    authenticateToken: function(req,res,next) {
        if (authHeader == undefined || authHeader == null){
            res.sendStatus(401);
            return;
        }
        const authHeader = req.headers['authorization'];
        // res.send(authHeader);
        const token = authHeader && authHeader.split(' ')[1];
        if(token == null) {
            return res.sendStatus(401);
        }
        // console.log("access token:", token);

        require('jsonwebtoken').verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
            if(err) console.log(err);
            if(err) return res.sendStatus(403);
            next();
        })
    },
    filePermission: async function(req, res, next){
        const authHeader = req.headers['authorization'];
        if (authHeader == undefined || authHeader == null){
            res.sendStatus(401);
            return;
        }
        const token = authHeader && authHeader.split(' ')[1];
        try {
            var tmp = await require('jsonwebtoken').decode(token);
        } catch (err) {
            res.sendStatus(401);
            return;
        }
        // console.log(tmp);
        var user = await require('../Utils/utilsAccount').getByUsername(tmp.name);
        user = user[0];
        
        if (user.length == 0){
            res.json({"res":"Người dùng không hợp lệ"});
        }
        else{
            if (user[0].permission === "admin")
                next();
            else
                return res.send(null);
        }
    },
    authenticateAdmin: async function(req, res, next){
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        var tmp = await require('jsonwebtoken').decode(token);
        // console.log(tmp);
        var user = await require('../Utils/utilsAccount').getByUsername(tmp.name);
        user = user[0];
        
        if (user.length == 0){
            res.json({"res":"Người dùng không hợp lệ"});
        }
        else{
            if (user[0].permission === "admin")
                next();
            else
                return res.send(null);
        }
    }
} 
