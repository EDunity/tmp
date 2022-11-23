var Socket = io();

var Width_Window = 800;
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
        this.Position = new Vector2(-1, -1);
        this.Movement = {};
    }
}

var Player_ = new Player();

var Count_PlayersInRoom = 0;

function setup()
{
    createCanvas(Width_Window, Height_Window);

    background(255);
}

//ゲーム開始時にConnect_Game関数を呼ぶ。
Socket.on("connect", Connect_Game);

function Connect_Game()
{
    Player_.ID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    Player_.Position = new Vector2(Math.random() * (Width_Window - Player_.Radius), Math.random() * (Height_Window - Player_.Radius));

    Socket.emit("Connect_Game", Player_);
}

$(document).on("keydown keyup", (_Event) => 
{
    var KeyToCommand = 
    {
        "w": "forward",
        "s": "back",
        "d": "right",
        "a": "left",
    };

    var Command = KeyToCommand[_Event.key];

    if(Command)
    {
        if(_Event.type === "keydown")
        {
            Player_.Movement[Command] = true;
        }
        else if(_Event.type === "keyup")
        {
            Player_.Movement[Command] = false;
        }

        Socket.emit("Move_Player", Player_.Movement);
    }
});

Socket.on("Update", function(_Players, _Rooms) 
{
    background(255);

    textSize(12);

    for(var i1 in _Players) 
    {
        if(_Players[i1].RoomName == Player_.RoomName)
        {
            if(_Players[i1].ID == Player_.ID)
            {
                fill(255, 0, 0);
            }
            else
            {
                fill(0, 0, 255);
            }

            circle(_Players[i1].Position.x, _Players[i1].Position.y , _Players[i1].Radius);
            text("ID: " + _Players[i1].ID, _Players[i1].Position.x + 15, _Players[i1].Position.y - 12 * 3);
            text("PN: " + _Players[i1].PlayerName, _Players[i1].Position.x + 15, _Players[i1].Position.y - 12 * 2);
            text("RN: " + _Players[i1].RoomName, _Players[i1].Position.x + 15, _Players[i1].Position.y - 12 * 1);
        }
    }

    textSize(25);
    fill(0);
    text("RN: " + Player_.RoomName, 5, 25 * 1);
    text("PC: " + _Rooms[Player_.RoomName], 5, 25 * 2);

    Count_PlayersInRoom = _Rooms[Player_.RoomName];
});

function Change_PlayerName()
{
    var PlayerName = document.getElementById("PlayerName").value;

    Player_.PlayerName = PlayerName;

    Socket.emit("Change_PlayerName", PlayerName);
}

function Join_RoomName()
{
    var RoomName = document.getElementById("RoomName").value;

    Player_.RoomName = RoomName;

    Socket.emit("Join_RoomName", RoomName);

    if(RoomName == "Lobby")
    {
        document.getElementById("Visible").style.visibility = "hidden";
    }
    else
    {
        document.getElementById("Visible").style.visibility = "visible";
    }
}

function Start_Game()
{
    if(Count_PlayersInRoom >= 2)
    {

    }
    else
    {
        
    }
}