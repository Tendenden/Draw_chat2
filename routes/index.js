var model = require('../user.js'),
    User  = model.User;
var fs = require('fs');    
 
var TITLE = 'NO_DATA';
 
exports.index = function(req, res){
    res.writeHead(200, {"Content-Type":"text/html"});
    var output = fs.readFileSync("./views/index.html", "utf-8");
    res.end(output);

};
 
/*exports.login = function(req, res){
    console.log("2");
    var username = req.query.username;
    var password = req.query.password;
 
    var query = { "username": username, "password": password };
 
    User.find(query, function(err, data) {
        if(err)
        {
            console.log(err);
        }
        if (data == "")
        {
            res.render('login', { title: TITLE });
        }
        else
        {
            req.session.user = {
                username: username,
                pass: password
            };
            req.session.cookie.username = username;
            console.log(req.session.user);
            res.redirect('/');
        }
    });
};*/

/*ユーザー登録機能*/
exports.add = function(req, res){
    var newUser = new User(req.body);
    newUser.save(function(err){
        if(err){
            console.log(err);
            res.render('login', { title: 'ERROR_PLEASE_INPUT_AGAIN'});
        }else{
            res.render('login', { kekka: req.body.username+"さんを追加しました"});
        }
    });
};

