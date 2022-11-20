var Express = require("express");//Webアプリを開発するためのフレームワーク
var Http = require("http");//サーバを構築する上で必要な機能を提供するモジュール
var Path = require("path");//ファイル名、ディレクトリ名、拡張子などのパス操作ができるモジュール
var SocketIO = require("socket.io");//リアルタイム双方向通信をサポートしてくれるライブラリ

var App = Express();
var Server = Http.Server(App);
var IO = SocketIO(Server);

var Port = process.env.PORT || 3000;
var FrameRate = 60;

var Width_Window = 600;
var Height_Window = 600;

class Player
{
    constructor(_UserName)
    {
        this.ID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.Name = _UserName;
        this.Width = 64;
        this.Height = 64;
        this.X = Math.random() * (Width_Window - this.Width);
        this.Y = Math.random() * (Height_Window - this.Height);
        this.Movement = {};
    }
};

var Players = {};

//クライアントが接続した時に呼ばれる関数
IO.on("connection", function(Socket) 
{
    var Player_ = null;

    Socket.on("GameStart", function(_UserName) 
    {
        if(_UserName == "" || _UserName == null)
        {
            _UserName = "Anonymous";
        }

        Player_ = new Player(_UserName);

        Players[Player_.ID] = Player_;
    });

    Socket.on("Movement", function(_Movement) 
    {
        if(Player_ != null)
        {
            Player_.Movement = _Movement;
        }
    });

    Socket.on("disconnect", () => 
    {
        if(Player_ != null)
        {
            delete Players[Player_.ID];

            Player_ = null;
        }
    });
});

//1秒にFrameRate回呼ばれる関数
setInterval(function() 
{
    for(var i1 in Players) 
    {
        if(Players[i1].Movement.forward)
        {
            Players[i1].Y -= 5;
        }
        if(Players[i1].Movement.back)
        {
            Players[i1].Y += 5;
        }
        if(Players[i1].Movement.right)
        {
            Players[i1].X += 5;
        }
        if(Players[i1].Movement.left)
        {
            Players[i1].X -= 5;
        }
    }

    IO.sockets.emit("state", Players);

}, 1000 / FrameRate);

//publicファイルを提供する関数
App.use("/public", Express.static(__dirname + "/public"));

App.get("/", (_Request, _Response) => 
{
    //クライアントから要求があった時にPath.join(__dirname, "/public/index.html")へ飛ばす。
    _Response.sendFile(Path.join(__dirname, "/public/index.html"));
});

//サーバーの待ち受けを開始する関数
Server.listen(Port, function() 
{
    console.log("Starting Server on port " + Port + ".");
});