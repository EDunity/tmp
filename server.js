class Player
{
    constructor()
    {
        this.SocketID = "";
        this.PlayerName = "";
        this.State = ""
        this.Team = "";
        this.Index = -1;
        this.Hand = [];
        this.Health = -1;
        this.Shield = -1;
        this.Ammo = -1;

        this.RoomName = "";
    }
}

class Room
{
    constructor()
    {
        this.RoomName = "";
        this.Players = [];
        this.Order = [];
        this.Side = "";
        this.Turn = -1;
        this.Target = -1;
        this.Value = -1;
        this.Type = "";
    }
}


var Express = require("express");
var Http = require("http");
var Path = require("path");
var SocketIO = require("socket.io");

var App = Express();
var Server = Http.createServer(App);
var IO = SocketIO(Server);

var Port = process.env.PORT || 3000;

var Players = {};
var Rooms = {};

IO.on("connection", function(_Socket) 
{
    _Socket.on("Connect_Game", function() 
    {
        Players[_Socket.id] = new Player();
        Players[_Socket.id].SocketID = _Socket.id;
        Players[_Socket.id].PlayerName = "Player#" + _Socket.id;
        Players[_Socket.id].State = "Title";

        IO.emit("Update_Info", Players, Rooms);

        IO.to(_Socket.id).emit("Change_SocketID", _Socket.id);

        Debug_Players();
    });

    _Socket.on("Change_PlayerName", function(_PlayerName) 
    {
        Players[_Socket.id].PlayerName = _PlayerName;

        IO.emit("Update_Info", Players, Rooms);

        Debug_Players();
    });

    _Socket.on("Change_PlayerState", function(_State) 
    {
        Players[_Socket.id].State = _State;

        IO.emit("Update_Info", Players, Rooms);
    });

    _Socket.on("Change_RoomState", function(_State) 
    {
        for(var i1 in Rooms[Players[_Socket.id].RoomName].Players) 
        {
            Players[Rooms[Players[_Socket.id].RoomName].Players[i1]].State = _State;
        }

        IO.to(Players[_Socket.id].RoomName).emit("Update_Info", Players, Rooms);

        IO.to(Players[_Socket.id].RoomName).emit("Change_Show");

        IO.to(Players[_Socket.id].RoomName).emit("Change_State", _State);
    });

    _Socket.on("Change_Status", function(_SocketID, _Health, _Shield, _Ammo) 
    {
        Players[_SocketID].Health = _Health;
        Players[_SocketID].Shield = _Shield;
        Players[_SocketID].Ammo = _Ammo;

        IO.emit("Update_Info", Players, Rooms);
    });

    _Socket.on("Change_Team", function(_Team) 
    {
        Players[_Socket.id].Team = _Team;

        IO.emit("Update_Info", Players, Rooms);

        IO.to(Players[_Socket.id].RoomName).emit("Change_Show");
    });

    _Socket.on("Change_Index", function(_Index) 
    {
        Players[_Socket.id].Index = _Index;

        IO.emit("Update_Info", Players, Rooms);
    });

    _Socket.on("Change_Hand", function(_Hand) 
    {
        Players[_Socket.id].Hand = _Hand;

        IO.emit("Update_Info", Players, Rooms);
    });
    
    _Socket.on("Change_Order", function() 
    {
        Rooms[Players[_Socket.id].RoomName].Order = Rooms[Players[_Socket.id].RoomName].Players.slice();

        IO.emit("Update_Info", Players, Rooms);
    });

    _Socket.on("Change_Side", function() 
    {
        Rooms[Players[_Socket.id].RoomName].Side = Rooms[Players[_Socket.id].RoomName].Side == "" || Rooms[Players[_Socket.id].RoomName].Side == "B" ? "A" : "B";

        IO.emit("Update_Info", Players, Rooms);
    });

    _Socket.on("Change_Turn", function() 
    {
        Rooms[Players[_Socket.id].RoomName].Side = "A";

        Rooms[Players[_Socket.id].RoomName].Turn = (Rooms[Players[_Socket.id].RoomName].Turn + 1) % Rooms[Players[_Socket.id].RoomName].Order.length
        
        Rooms[Players[_Socket.id].RoomName].Target = Rooms[Players[_Socket.id].RoomName].Turn;

        IO.emit("Update_Info", Players, Rooms);
    });

    _Socket.on("Change_Target", function(_Target) 
    {
        Rooms[Players[_Socket.id].RoomName].Target = _Target;

        IO.emit("Update_Info", Players, Rooms);
    });

    _Socket.on("Change_Value", function(_Value, _Type) 
    {
        Rooms[Players[_Socket.id].RoomName].Value = _Value;
        Rooms[Players[_Socket.id].RoomName].Type = _Type;

        IO.emit("Update_Info", Players, Rooms);
    });

    _Socket.on("Join_Room", function(_RoomName) 
    {
        if(!(_RoomName in Rooms))
        {
            Rooms[_RoomName] = new Room();
            Rooms[_RoomName].RoomName = _RoomName;
        }

        Rooms[_RoomName].Players.push(_Socket.id);

        Players[_Socket.id].RoomName = _RoomName;

        _Socket.join(_RoomName);

        IO.emit("Update_Info", Players, Rooms);

        IO.to(_RoomName).emit("Change_Show");

        Debug_Rooms();
    });
    
    _Socket.on("Leave_Room", function() 
    {
        var RoomName = Players[_Socket.id].RoomName;

        if(RoomName in Rooms)
        {
            Rooms[RoomName].Players.splice(Rooms[RoomName].Players.indexOf(_Socket.id), 1);
            Rooms[RoomName].Order.splice(Rooms[RoomName].Order.indexOf(_Socket.id), 1);
    
            if(Rooms[RoomName].Order.length <= Rooms[RoomName].Turn)
            {
                Rooms[RoomName].Turn = Rooms[RoomName].Turn % Rooms[RoomName].Order.length;
            }

            Rooms[RoomName].Target = Rooms[RoomName].Turn;

            Players[_Socket.id].RoomName = "";

            if(Rooms[RoomName].Players.length == 0)
            {
                delete Rooms[RoomName];
            }

            _Socket.leave(RoomName);
        }

        IO.emit("Update_Info", Players, Rooms);

        IO.to(RoomName).emit("Change_Show");

        Debug_Rooms();
    });

    _Socket.on("disconnect", function()
    {
        var RoomName = Players[_Socket.id].RoomName;

        if(RoomName in Rooms)
        {
            Rooms[RoomName].Players.splice(Rooms[RoomName].Players.indexOf(_Socket.id), 1);
            Rooms[RoomName].Order.splice(Rooms[RoomName].Order.indexOf(_Socket.id), 1);

            if(Rooms[RoomName].Order.length <= Rooms[RoomName].Turn)
            {
                Rooms[RoomName].Turn = Rooms[RoomName].Turn % Rooms[RoomName].Order.length;
            }

            Rooms[RoomName].Target = Rooms[RoomName].Turn;
    
            Players[_Socket.id].RoomName = "";

            if(Rooms[RoomName].Players.length == 0)
            {
                delete Rooms[RoomName];
            }

            _Socket.leave(RoomName);
        }

        delete Players[_Socket.id];

        IO.emit("Update_Info", Players, Rooms);

        IO.to(RoomName).emit("Change_Show");

        Debug_Rooms();
    });
});

App.use("/public", Express.static(__dirname + "/public"));

App.get("/", (_Request, _Response) => 
{
    _Response.sendFile(Path.join(__dirname, "/public/index.html"));
});

Server.listen(Port, function() 
{
    console.log("[Port] " + Port);
});

function Debug_Players()
{
    console.log("---------- Players ----------");

    for(var i1 in Players) 
    {
        console.log(Players[i1].PlayerName);
    }

    console.log("-----------------------------");
}
function Debug_Rooms()
{
    console.log("---------- Rooms ----------");

    for(var i1 in Rooms) 
    {
        console.log("[RoomName] " + Rooms[i1].RoomName);

        for(var i2 in Rooms[i1].Players)
        {
            console.log(Players[Rooms[i1].Players[i2]].PlayerName);
        }
    }
    console.log("---------------------------");
}