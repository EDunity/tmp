var Express = require("express");//Webアプリを開発するためのフレームワーク
var Http = require("http");//サーバを構築する上で必要な機能を提供するモジュール
var Path = require("path");//ファイル名、ディレクトリ名、拡張子などのパス操作ができるモジュール
var _SocketIO = require("socket.io");//リアルタイム双方向通信をサポートしてくれるライブラリ

var App = Express();
var Server = Http.createServer(App);
var IO = _SocketIO(Server);

var Port = process.env.PORT || 3000;
var FrameRate = 60;

var Width_Window = 1000;
var Height_Window = 600;

class Vector2
{
    constructor(_X = 0, _Y = 0)
    {
        this.X = _X;
        this.Y = _Y;
    }
};

class Player
{
    constructor(_ID)
    {
        this.ID = _ID;
        this.PlayerName = "NoName";
        this.RoomName = "Lobby";
        this.Radius = 30;
        this.Speed = 5;
        this.Position = new Vector2(Width_Window / 2, Height_Window / 2);
        this.Movement = {};
    }
}

class Room
{
    constructor(_RoomName = "Lobby")
    {
        this.RoomName = _RoomName;
        this.Members = [];
        this.State = false;
    }
}

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

    _Socket.on("Connect_Game", function(_ID) 
    {
        // if(_ID != null)
        if(true)
        {
            Player_ = new Player(_ID);

            Players[Player_.ID] = Player_;

            if(!(Player_.RoomName in Rooms))
            {
                Rooms[Player_.RoomName] = new Room(Player_.RoomName);
            }

            Rooms[Player_.RoomName].Members.push(Player_);

            _Socket.join(Player_.RoomName);

            Debug_Rooms();
        }
    });

    _Socket.on("Change_PlayerName", function(_PlayerName) 
    {
        // if(_PlayerName != null)
        if(true)
        {
            Players[Player_.ID].PlayerName = _PlayerName;
        }
    });

    _Socket.on("Join_RoomName", function(_RoomName) 
    {
        // if(_RoomName != null)
        if(true)
        {
            var Index = Rooms[Player_.RoomName].Members.indexOf(Player_);
            Rooms[Player_.RoomName].Members.splice(Index, 1);

            if(Rooms[Player_.RoomName].Members.length == 0)
            {
                delete Rooms[Player_.RoomName];
            }

            _Socket.leave(Player_.RoomName);

            _Socket.join(_RoomName);

            Players[Player_.ID].RoomName = _RoomName;

            if(!(_RoomName in Rooms))
            {
                Rooms[_RoomName] = new Room(_RoomName);
            }

            Rooms[_RoomName].Members.push(Player_);

            Debug_Rooms();
        }
    });

    _Socket.on("Move_Player", function(_Movement) 
    {
        // if(_Movement != null)
        if(true)
        {
            Player_.Movement = _Movement;
        }
    });

    _Socket.on("Start_Game", function(_RoomName) 
    {
        // if(_RoomName != null)
        if(true)
        {
            if(!Rooms[_RoomName].State && Rooms[_RoomName].Members.length >= 2)
            {
                Rooms[_RoomName].State = true;
            }
        }
    });

    _Socket.on("End_Game", function(_RoomName) 
    {
        // if(_RoomName != null)
        if(true)
        {

        }
    });

    _Socket.on("disconnect", function()
    {
        var Index = Rooms[Player_.RoomName].Members.indexOf(Player_);
        Rooms[Player_.RoomName].Members.splice(Index, 1);

        if(Rooms[Player_.RoomName].Members.length == 0)
        {
            delete Rooms[Player_.RoomName];
        }

        delete Players[Player_.ID];
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
            console.log(Rooms[i1].RoomName + ": ");

            for(var i2 in Rooms[i1].Members)
            {
                console.log("  " + i2 + ": " + Rooms[i1].Members[i2].PlayerName);
            }
        }
    }
    
    //1秒にFrameRate回呼ばれる関数
    // setInterval(function() 
    // {
    //     IO.emit("Update", Players, Rooms);

    // }, 1000 / FrameRate);
});

//1秒にFrameRate回呼ばれる関数
setInterval(function() 
{
    for(var i1 in Players) 
    {
        if(Players[i1].Movement.forward)
        {
            Players[i1].Position.Y -= Players[i1].Speed;
        }
        if(Players[i1].Movement.back)
        {
            Players[i1].Position.Y += Players[i1].Speed;
        }
        if(Players[i1].Movement.right)
        {
            Players[i1].Position.X += Players[i1].Speed;
        }
        if(Players[i1].Movement.left)
        {
            Players[i1].Position.X -= Players[i1].Speed;
        }

        Players[i1].Position.X = Clamp(Players[i1].Position.X, 0, Width_Window);
        Players[i1].Position.Y = Clamp(Players[i1].Position.Y, 0, Height_Window);
    }

    IO.emit("Update", Players, Rooms);

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