// app.js
var express = require('express');
var http = require('http');
var app = express();
var routes = require('./routes/index.js');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var fs = require("fs");

var server = http.createServer(app);
var socketio = require("socket.io");
var domain = 'mongodb://localhost/user';
var cookieParser = require('cookie-parser');
var id = 0;
var userHash = {};
var userlist = new Array();
var model = require('./user.js'),
    User  = model.User;

var cookie;
var temp_name;
//var expressSession = require('express-session');
//var expressHbs = require('express3-handlebars');
//var mongoUrl = 'mongodb://localhost:27017/dbname';
//var MongoStore = require('connect-mongo')(expressSession);
app.use(express.static(__dirname + '/views'));
//var mongo = require('./mongo');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(require('body-parser')());
app.use(cookieParser());
app.use(session({
        secret: 'secret',
        store: new MongoStore({
            db: 'session',
            url: domain,
            clear_interval: 60 * 60
        }),
        cookie: {
            //username: 'username',
            httpOnly: false,
            maxAge: new Date(Date.now() + 60 * 60 * 1000)
        }
    }));
if(app.env =='development'){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
};

if(app.env == 'production'){
    app.use(express.errorHandler());
};

var loginCheck = function(req, res, next){
    if(req.session.user){
        next();
    }
    else{
        res.render('login');
    }
}

app.get('/', loginCheck, routes.index);
app.get('/login', function(req, res){
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
            delete res.cookie;
            req.session.user = {
                username: username,
                pass: password
            };
            
            temp_name = username;
            //res.setHeader('Set-Cookie', ['username:',+username]);
            res.redirect('/');
        }
    });
});
app.post('/add', routes.add);
app.get('/logout', function(req, res){
  req.session.destroy();
  console.log('deleted sesstion');
  res.render('login');
});

console.log('run server. port 3000.');
server.listen(3000);


// socket.IOを用いたリアルタイムWebを実装します。
var io = socketio.listen(server);

// 接続されたら、connected!とコンソールにメッセージを表示します。
io.sockets.on("connection", function (socket) {
  console.log("connected");
  
  socket.emit("ret_name",{value:temp_name});
  console.log(temp_name);
  //画像送信
  socket.on("send_img",function (data) {
    socket.broadcast.emit("broad_img", {value:data.value});
  });
  //ビデオ送信
  socket.on("send_video",function (data) {
    //console.log("on send_video"+data+data.value);
    socket.broadcast.emit("broad_video", {value:data.value});
  });
  //メッセージ送信
  socket.on("send_msg",function (data) {

    console.log("on send_msg");
    var msg = data.value;
    socket.broadcast.emit("broad_msg", {value:msg});
    //soket.broadcast.emit("broad_msg", {value: res.session.user});
  });

  // 描画情報がクライアントから渡されたら、接続中の他ユーザーへ
  // broadcastで描画情報を送ります。
  socket.on("send_page", function (data) {
    socket.broadcast.emit("send_page",{value:data.value});
  });
  socket.on("send_pdf", function (data) {
    socket.broadcast.emit("send_pdf",{value:data.value});
  });
  socket.on("all_clear", function () {
    socket.broadcast.emit("all_clear");
  });
  socket.on("draw", function (data) {
    //console.log(data);
    socket.broadcast.emit("draw", data);
  });
  socket.on("draw_alf", function (data) {
    //console.log(data);
    socket.broadcast.emit("draw_alf", data);
  });
  // 色変更情報がクライアントからきたら、
  // 他ユーザーへ変更後の色を通知します。
  socket.on("color", function (color) {
    //console.log(color);
    socket.broadcast.emit("color", color);
  });

  // 線の太さの変更情報がクライアントからきたら、
  // 他ユーザーへ変更後の線の太さを通知します。
  socket.on("lineWidth", function (width) {
    //console.log(width);
    socket.broadcast.emit("lineWidth", width);
  });
});

