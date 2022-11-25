var Socket = io();

var Width_Window = 1000;
var Height_Window = 600;

class Card
{
    constructor(_CardName = "NoName") 
    {
        this.CardName = _CardName;
        this.Width = 30;
        this.Height = 50;
        // this.Attack = _Attack;
        // this.Defense = _Defense;
        // this.Heal = _Heal;
    }
}

var Cards = [];

var PlayerID = "";
var Movement = {};
var Hand = [];

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

    Cards.push(new Card("Test1"));
    Cards.push(new Card("Test2"));
    Cards.push(new Card("Test3"));
}

//ゲーム開始時にConnect_Game関数を呼ぶ。
Socket.on("connect", Connect_Game);

function Connect_Game()
{
    Socket.emit("Connect_Game");
}

Socket.on("ID", function(_PlayerID) 
{   
    PlayerID = _PlayerID;
});

Socket.on("Update", function(_Players, _Rooms) 
{
    if(_Players[PlayerID] != undefined)
    {
        Player_ = _Players[PlayerID];
        Room_ = _Rooms[Player_.RoomName];

        if(Room_.State == "Wait")
        {
            background(255);

            textSize(12);

            if(Room_.Members != undefined)
            {
                for(var i1 in Room_.Members) 
                {
                    var Player = _Players[Room_.Members[i1]];

                    if(Player.PlayerID == Player_.PlayerID)
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
                    text("PlayerID: " + Player.PlayerID, Player.Position.X + 15, Player.Position.Y - 12 * 3);
                    text("Name: " + Player.PlayerName, Player.Position.X + 15, Player.Position.Y - 12 * 2);
                }
            }

            textSize(25);
            fill(0);
            text("Room: " + Player_.RoomName, 5, 25 * 1);
            text("Population: " + Room_.Members.length, 5, 25 * 2);
        }
        else if(Room_.State == "Prepare")
        {
            background(255);

            for(var i1 = 0; i1 < 10; i1++) 
            {
                Hand.push(Cards[Math.floor(Math.random() * Cards.length)]);
            }

            Socket.emit("Hand", Hand);

            // Socket.emit("Change_State", Room_.RoomName, "Attack");
        }
        else if(Room_.State == "Attack")
        {

        }
    }
});

$(document).on("keydown keyup", (_Event) => 
{
    if(Room_.State == "Wait")
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

            Socket.emit("Movement", Movement);
        }
    }
});

function Change_PlayerName()
{
    var PlayerName = document.getElementById("PlayerName").value;

    Socket.emit("Change_PlayerName", PlayerName);
}

function Change_RoomName()
{
    var RoomName = document.getElementById("RoomName").value;

    Socket.emit("Change_RoomName", RoomName);

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
    Socket.emit("Change_State", Room_.RoomName, "Prepare");
}