var Express = require("express");//Webアプリを開発するためのフレームワーク
var Http = require("http");//サーバを構築する上で必要な機能を提供するモジュール
var Path = require("path");//ファイル名、ディレクトリ名、拡張子などのパス操作ができるモジュール
var _SocketIO = require("socket.io");//リアルタイム双方向通信をサポートしてくれるライブラリ

var App = Express();
var Server = Http.createServer(App);
var IO = _SocketIO(Server);

var Port = process.env.PORT || 3000;
var FrameRate = 60;

var Width_Window = 800;
var Height_Window = 600;

var Players = {};
var Rooms = {};

function Clamp(_Num, _Min, _Max)
{
    return Math.min(Math.max(_Num, _Min), _Max);
}

//クライアントが接続した時に呼ばれる関数
IO.on("connection", function(_Socket) 
{
    var Player_ = null;

    _Socket.on("Connect_Game", function(_Player) 
    {
        Player_ = _Player;

        Players[Player_.ID] = Player_;

        _Socket.join(Players[Player_.ID].RoomName);

        if(Rooms[Players[Player_.ID].RoomName] == undefined)
        {
            Rooms[Players[Player_.ID].RoomName] = 1;
        }
        else
        {
            Rooms[Players[Player_.ID].RoomName] += 1;
        }

        Debug_Rooms();
    });

    _Socket.on("Change_PlayerName", function(_PlayerName) 
    {
        Players[Player_.ID].PlayerName = _PlayerName;
    });

    _Socket.on("Join_RoomName", function(_RoomName) 
    {
        Rooms[Players[Player_.ID].RoomName] -= 1;

        if(Rooms[Players[Player_.ID].RoomName] == 0)
        {
            delete Rooms[Players[Player_.ID].RoomName];
        }

        _Socket.leave(Players[Player_.ID].RoomName);

        _Socket.join(_RoomName);
        Players[Player_.ID].RoomName = _RoomName;

        if(Rooms[_RoomName] == undefined)
        {
            Rooms[_RoomName] = 1;
        }
        else
        {
            Rooms[_RoomName] += 1;
        }

        Debug_Rooms();
    });

    _Socket.on("Move_Player", function(_Movement) 
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
            Rooms[Players[Player_.ID].RoomName] -= 1;

            if(Rooms[Player_.RoomName] == 0)
            {
                delete Rooms[Player_.RoomName];
            }

            delete Players[Player_.ID];

            Player_ = null;

            Debug_Rooms();
        }
    });

    function Debug_Players()
    {
        console.log("---------- Players ----------");
        for(var i1 in Players) 
        {
            console.log(i1 + ": " + Players[i1]);
        }
    }

    function Debug_Rooms()
    {
        console.log("---------- Rooms ----------");
        for(var i1 in Rooms) 
        {
            console.log(i1 + ": " + Rooms[i1]);
        }
    }
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

    IO.sockets.emit("Update", Players, Rooms);

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