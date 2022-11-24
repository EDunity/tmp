var Socket = io();

var Width_Window = 1000;
var Height_Window = 600;

var ID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
var Movement = {};

var Player_ = null;
var Room_ = null;

var KeyToCommand = 
{
    "w": "forward",
    "s": "back",
    "d": "right",
    "a": "left",
};

function setup()
{
    createCanvas(Width_Window, Height_Window);
}

//ゲーム開始時にConnect_Game関数を呼ぶ。
Socket.on("connect", Connect_Game);

function Connect_Game()
{
    Socket.emit("Connect_Game", ID);
}

Socket.on("Update", function(_Players, _Rooms) 
{
    if(_Players[ID] != undefined)
    {
        Player_ = _Players[ID];
        Room_ = _Rooms[Player_.RoomName];

        if(!Room_.State)
        {
            background(255);

            textSize(12);

            if(Room_.Members != undefined)
            {
                for(var i1 in Room_.Members) 
                {
                    var Player = Room_.Members[i1];

                    if(Player.ID == Player_.ID)
                    {
                        fill(255, 0, 0);
                    }
                    else
                    {
                        fill(0, 0, 255);
                    }

                    stroke(0);
                    strokeWeight(4);
                    circle(Player.Position.X, Player.Position.Y , Player.Radius);

                    stroke(0);
                    noStroke();
                    text("ID: " + Player.ID, Player.Position.X + 15, Player.Position.Y - 12 * 3);
                    text("Name: " + Player.PlayerName, Player.Position.X + 15, Player.Position.Y - 12 * 2);
                }
            }

            textSize(25);
            fill(0);
            text("Room: " + Player_.RoomName, 5, 25 * 1);
            text("Population: " + Room_.Members.length, 5, 25 * 2);
        }
        else
        {
            background(255);


        }
    }
});

$(document).on("keydown keyup", (_Event) => 
{
    if(!Room_.State)
    {
        if(KeyToCommand[_Event.key] != undefined)
        {
            if(_Event.type === "keydown")
            {
                Movement[KeyToCommand[_Event.key]] = true;
            }
            else if(_Event.type === "keyup")
            {
                Movement[KeyToCommand[_Event.key]] = false;
            }

            Socket.emit("Move_Player", Movement);
        }
    }
    else
    {

    }
});

function Change_PlayerName()
{
    var PlayerName = document.getElementById("PlayerName").value;

    Socket.emit("Change_PlayerName", PlayerName);
}

function Join_RoomName()
{
    var RoomName = document.getElementById("RoomName").value;

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
    Socket.emit("Start_Game", Player_.RoomName);
}