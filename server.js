var Express = require("express");//Webアプリを開発するためのフレームワーク
var Http = require("http");//サーバを構築する上で必要な機能を提供するモジュール
var Path = require("path");//ファイル名、ディレクトリ名、拡張子などのパス操作ができるモジュール
var _SocketIO = require("socket.io");//リアルタイム双方向通信をサポートしてくれるライブラリ

var App = Express();
var Server = Http.createServer(App);
var IO = _SocketIO(Server);

var Port = process.env.PORT || 3000;
var FrameRate = 60;

var Width_Window = 600;
var Height_Window = 600;

class Vector2
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }
};

class Player
{
    constructor()
    {
        this.ID = -1;
        this.PlayerName = "NoName";
        this.RoomName = "Lobby";
        this.Radius = 30;
        this.Position = new Vector2((Width_Window - this.Radius), (Height_Window - this.Radius));
        this.Movement = {};
    }
};

function Clamp(num, min, max)
{
    return Math.min(Math.max(num, min), max);
}

var Players = {};

//クライアントが接続した時に呼ばれる関数
IO.on("connection", function(_Socket) 
{
    var Player_ = null;

    _Socket.on("GameStart", function(_ID) 
    {
        Player_ = new Player();

        Player_.ID = _ID;

        Players[Player_.ID] = Player_;

        _Socket.join(Players[Player_.ID].RoomName);
    });

    _Socket.on("Change_PlayerName", function(_PlayerName) 
    {
        Players[Player_.ID].PlayerName = _PlayerName;
    });

    _Socket.on("Change_RoomName", function(_RoomName) 
    {
        _Socket.leave(Players[Player_.ID].RoomName);

        _Socket.join(_RoomName);
        Players[Player_.ID].RoomName = _RoomName;
    });

    _Socket.on("Movement", function(_Movement) 
    {
        if(Player_ != null)
        {
            Player_.Movement = _Movement;
        }
    });

    _Socket.on("disconnect", () => 
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
            Players[i1].Position.y -= 5;
        }
        if(Players[i1].Movement.back)
        {
            Players[i1].Position.y += 5;
        }
        if(Players[i1].Movement.right)
        {
            Players[i1].Position.x += 5;
        }
        if(Players[i1].Movement.left)
        {
            Players[i1].Position.x -= 5;
        }

        Players[i1].Position.x = Clamp(Players[i1].Position.x, 0, Width_Window);
        Players[i1].Position.y = Clamp(Players[i1].Position.y, 0, Height_Window);
    }

    IO.sockets.emit("Update", Players);

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