var Socket = io();

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
}

var Player_ = new Player();

function setup()
{
    createCanvas(Width_Window, Height_Window);

    background(255);
}

//ゲーム開始時にGameStart関数を呼ぶ。
Socket.on("connect", GameStart);

function GameStart()
{
    Player_.ID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

    Socket.emit("GameStart", Player_.ID);
}

$(document).on("keydown keyup", (_Event) => 
{
    var KeyToCommand = 
    {
        "ArrowUp": "forward",
        "ArrowDown": "back",
        "ArrowRight": "right",
        "ArrowLeft": "left",
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

        Socket.emit("Movement", Player_.Movement);
    }
});

Socket.on("Update", function(_Players) 
{
    background(255);

    textSize(25);

    text("RN: " + Player_.RoomName, 5, 25);

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

            text("ID: " + _Players[i1].ID, _Players[i1].Position.x + 15, _Players[i1].Position.y - 45);
            text("PN: " + _Players[i1].PlayerName, _Players[i1].Position.x + 15, _Players[i1].Position.y - 30);
            text("RN: " + _Players[i1].RoomName, _Players[i1].Position.x + 15, _Players[i1].Position.y - 15);
            circle(_Players[i1].Position.x, _Players[i1].Position.y , _Players[i1].Radius);
        }
    }
});

// Socket.on("tmp", function() 
// {
//     console.log("yes");
// });

function Change_PlayerName()
{
    var PlayerName = document.getElementById("PlayerName").value;

    Player_.PlayerName = PlayerName;

    Socket.emit("Change_PlayerName", PlayerName);
}

function Change_RoomName()
{
    var RoomName = document.getElementById("RoomName").value;

    Player_.RoomName = RoomName;

    Socket.emit("Change_RoomName", RoomName);
}