var Express = require("express");//Webアプリを開発するためのフレームワーク
var Http = require("http");//サーバを構築する上で必要な機能を提供するモジュール
var Path = require("path");//ファイル名、ディレクトリ名、拡張子などのパス操作ができるモジュール
var SocketIO = require("socket.io");//リアルタイム双方向通信をサポートしてくれるライブラリ

var App = Express();
var Server = Http.createServer(App);
var IO = SocketIO(Server);

var Port = process.env.PORT || 3000;
var FrameRate = 60;

var Width_Window = 1024;
var Height_Window = 768;

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
    constructor()
    {
        this.PlayerID = "";
        this.PlayerName = "NoName";
        this.Position = new Vector2(Width_Window / 2, Height_Window / 2);
        this.Health = 100;
        this.Radius = 30;
        this.Speed = 5;
        this.Movement = {};
        this.Hand = [];

        this.RoomName = "Lobby";
    }
}

class Room
{
    constructor()
    {
        this.RoomName = "Lobby";
        this.Members = [];
        this.Order = [];
        this.Turn = "";
        this.Type = "";
        this.State = "Wait";
    }
}

var Players = {};
var Rooms = {};

function Clamp_Value(_Value, _Min, _Max)
{
    return Math.min(Math.max(_Value, _Min), _Max);
}

function Get_ShuffledArray(_Array)
{
    var Array_ = [];

    while(_Array.length > 0) 
    {
      var i1 = Math.floor(Math.random() * _Array.length);
    
      Array_.push(_Array[i1]);
      _Array.splice(i1, 1);
    }

    return Array_;
}

//クライアントが接続した時に呼ばれる関数
IO.on("connection", function(_Socket) 
{
    var Player_ = null;

    _Socket.on("Connect_Game", function() 
    {
        Player_ = new Player();
        Player_.PlayerID = _Socket.id;

        Players[Player_.PlayerID] = Player_;

        if(!(Player_.RoomName in Rooms))
        {
            Rooms[Player_.RoomName] = new Room();
        }

        Rooms[Player_.RoomName].Members.push(Player_.PlayerID);

        _Socket.join(Player_.RoomName);

        IO.to(_Socket.id).emit("ID", Player_.PlayerID);

        Debug_Players();
        Debug_Rooms();
    });

    _Socket.on("Change_PlayerName", function(_PlayerName) 
    {
        Players[Player_.PlayerID].PlayerName = _PlayerName;
    });

    _Socket.on("Change_RoomName", function(_RoomName) 
    {
        var Index = Rooms[Player_.RoomName].Members.indexOf(Player_.PlayerID);
        Rooms[Player_.RoomName].Members.splice(Index, 1);

        if(Rooms[Player_.RoomName].Members.length == 0)
        {
            delete Rooms[Player_.RoomName];
        }

        _Socket.leave(Player_.RoomName);

        _Socket.join(_RoomName);

        Players[Player_.PlayerID].RoomName = _RoomName;

        if(!(_RoomName in Rooms))
        {
            Rooms[_RoomName] = new Room();
            Rooms[_RoomName].RoomName = _RoomName;
            Rooms[_RoomName].State = "Wait";
        }

        Rooms[_RoomName].Members.push(Player_.PlayerID);

        Debug_Players();
        Debug_Rooms();
    });

    _Socket.on("Movement", function(_Movement) 
    {
        Player_.Movement = _Movement;
    });

    _Socket.on("Hand", function(_Hand) 
    {
        Player_.Hand = _Hand;
    });

    _Socket.on("Change_State", function(_RoomName, _State) 
    {
        if(_State == "Prepare")
        {
            if(Rooms[_RoomName].State == "Wait" && Rooms[_RoomName].Members.length >= 2)
            {
                Rooms[_RoomName].Order = Get_ShuffledArray(Rooms[_RoomName].Members.slice());

                Rooms[_RoomName].Turn = Rooms[_RoomName].Order[0];

                Rooms[_RoomName].Type = "Attack";

                Rooms[_RoomName].State = "Prepare";

                IO.to(_RoomName).emit("Impulse", Players, Rooms);
            }
        }
        else if(_State == "Play")
        {
            if(Rooms[_RoomName].State == "Prepare")
            {
                Rooms[_RoomName].State = "Play";
                
                IO.to(_RoomName).emit("Impulse", Players, Rooms);
            }
        }   
    });

    _Socket.on("Next_Turn", function(_RoomName, _Type) 
    {
        var Index = Rooms[_RoomName].Order.indexOf(Rooms[_RoomName].Turn);

        Rooms[_RoomName].Turn = Rooms[_RoomName].Order[(Index + 1) % Rooms[_RoomName].Members.length];

        Rooms[_RoomName].Type = _Type;

        IO.to(_RoomName).emit("Impulse", Players, Rooms);
    });

    _Socket.on("disconnect", function()
    {
        var Index = Rooms[Player_.RoomName].Members.indexOf(Player_.PlayerID);
        Rooms[Player_.RoomName].Members.splice(Index, 1);

        if(Rooms[Player_.RoomName].Members.length == 0)
        {
            delete Rooms[Player_.RoomName];
        }

        delete Players[Player_.PlayerID];
    });

    function Debug_Players()
    {
        console.log("---------- Players ----------");
        for(var i1 in Players) 
        {
            console.log(i1 + ": " + Players[i1].PlayerName);
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
                console.log("  " + i2 + ": " + Players[Rooms[i1].Members[i2]].PlayerName);
            }
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

        Players[i1].Position.X = Clamp_Value(Players[i1].Position.X, 0, Width_Window);
        Players[i1].Position.Y = Clamp_Value(Players[i1].Position.Y, 0, Height_Window);
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