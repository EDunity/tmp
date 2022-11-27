var Socket = io();

var Width_Window = 1024;
var Height_Window = 768;

var Width_Card = 128;
var Height_Card = 160;
var Space_Card = 16;

var Width_Button = 128;
var Height_Button = 64;
var Space_Button = 16;

var Count_Hand = 10;

var Index = -1;

class Vector2
{
    constructor(_X = 0, _Y = 0)
    {
        this.X = _X;
        this.Y = _Y;
    }

    Add(_Position)
    {
        return new Vector2(this.X + _Position.X, this.Y + _Position.Y);
    }
};

class Card
{
    constructor() 
    {
        this.CardName = "NoName";
        this.Position = new Vector2(0, 0);
        this.Color = color(255);
        this.Attack = 0;
        this.Defense = 0;
        this.Heal = 0;
    }

    Draw()
    {
        stroke(0);
        strokeWeight(1);
        fill(this.Color);
        rect(this.Position.X, this.Position.Y, Width_Card, Height_Card);

        textSize(15);
        stroke(0);
        noStroke();
        fill(0);
        text(this.CardName, this.Position.X + 5, this.Position.Y + 15 * 1);

        textSize(12);
        stroke(0);
        noStroke();
        fill(0);
        text("Attack: " + this.Attack, this.Position.X + 5, this.Position.Y + 12 * 2 + 90);
        text("Defense: " + this.Defense, this.Position.X + 5, this.Position.Y + 12 * 3 + 90);
        text("Heal: " + this.Heal, this.Position.X + 5, this.Position.Y + 12 * 4 + 90);
    }

    Shadow()
    {
        stroke(0);
        strokeWeight(1);
        fill(0, 50);
        rect(this.Position.X, this.Position.Y, Width_Card, Height_Card);
    }

    Check_PointIsOn(_Position)
    {
        return this.Position.X < _Position.X && this.Position.X + Width_Card > _Position.X && this.Position.Y < _Position.Y && this.Position.Y + Height_Card > _Position.Y;
    }
}

class Button
{
    constructor() 
    {
        this.ButtonName = "NoName";
        this.Position = new Vector2(0, 0);
        this.Color = color(255);
        this.Space = 16;
    }

    Draw()
    {
        stroke(0);
        strokeWeight(1);
        fill(this.Color);
        rect(this.Position.X, this.Position.Y, Width_Button, Height_Button);

        textSize(15);
        stroke(0);
        noStroke();
        fill(0);
        text(this.ButtonName, this.Position.X + 5, this.Position.Y + 15 * 1);
    }

    Check_PointIsOn(_Position)
    {
        return this.Position.X < _Position.X && this.Position.X + Width_Button > _Position.X && this.Position.Y < _Position.Y && this.Position.Y + Height_Button > _Position.Y;
    }
}

var Cards = [];
var Buttons = [];

var PlayerID = "";
var Movement = {};
var Hand = [];

var Players_ = null;
var Rooms_ = null;
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

    var Card_ = null;

    Card_ = new Card();
    Card_.CardName = "AttackCard";
    Card_.Attack = 10;
    Cards.push(Card_);

    Card_ = new Card();
    Card_.CardName = "DefenseCard";
    Card_.Defense = 10;
    Cards.push(Card_);

    Card_ = new Card();
    Card_.CardName = "HealCard";
    Card_.Heal = 10;
    Cards.push(Card_);

    var Button_ = null;

    Button_ = new Button();
    Button_.ButtonName = "SelectButton";
    Buttons.push(Button_);

    Button_ = new Button();
    Button_.ButtonName = "ThrowAwayButton";
    Buttons.push(Button_);
}

function Draw_Stage()
{
    stroke(0);
    strokeWeight(4);
    fill(255);
    rect(0, 0, Width_Window, (Height_Window / 2));

    for(var i1 in Room_.Members)
    {
        var j1 = Players_[Room_.Members[i1]];


    }
}
function Draw_Table()
{
    stroke(0);
    strokeWeight(4);
    fill(86, 179, 127);
    rect(0, (Height_Window / 2), Width_Window, (Height_Window / 2));

    for(var i1 = 0; i1 < Hand.length; i1++)
    {
        var Position = new Vector2((i1 % (Count_Hand / 2)) * Width_Card, floor(i1 / (Count_Hand / 2)) * Height_Card);
        var Space = new Vector2((i1 % (Count_Hand / 2)) * Space_Card + Space_Card, floor(i1 / 5) * Space_Card + Space_Card);
        var Margin = new Vector2(0, (Height_Window / 2));

        Hand[i1].Position = Position.Add(Space.Add(Margin));
        Hand[i1].Draw();

        if(i1 == Index)
        {
            Hand[i1].Shadow();
        }
    }

    for(var i1 = 0; i1 < Buttons.length; i1++)
    {
        var Position = new Vector2((i1 % 1) * Width_Button, floor(i1 / 1) * Height_Button);
        var Space = new Vector2((i1 % 1) * Space_Button + Space_Button, floor(i1 / 1) * Space_Button + Space_Button);
        var Margin = new Vector2(Width_Card * (Count_Hand / 2) + Space_Button * (Count_Hand / 2), (Height_Window / 2));

        Buttons[i1].Position = Position.Add(Space.Add(Margin));
        Buttons[i1].Draw();
    }
}
function Draw_Debug1()
{
    textSize(25);
    stroke(0);
    noStroke();
    fill(0);
    text("Room: " + Player_.RoomName, 5, 25 * 1);
    text("State: " + Room_.State, 5, 25 * 2);
    text("Population: " + Room_.Members.length, 5, 25 * 3);
    text("Members: ", 5, 25 * 4);
    for(var i1 = 0; i1 < Room_.Members.length; i1++)
    {
        text("・" + Players_[Room_.Members[i1]].PlayerName,  5, 25 * (5 + i1));
    }
}
function Draw_Debug2()
{
    textSize(25);
    stroke(0);
    noStroke();
    fill(0);
    text("Room: " + Player_.RoomName, 5, 25 * 1);
    text("State: " + Room_.State, 5, 25 * 2);
    text("Turn: " + Players_[Room_.Turn].PlayerName, 5, 25 * 3);
    text("Turn: " + Room_.State == "Game" ? Players_[Room_.Turn].PlayerName : "", 5, 25 * 3);
    text("Type: " + Room_.Type, 5, 25 * 4);
    text("Population: " + Room_.Members.length, 5, 25 * 5);
    text("Members: ", 5, 25 * 6);
    for(var i1 = 0; i1 < Room_.Members.length; i1++)
    {
        text("・" + Players_[Room_.Members[i1]].PlayerName,  5, 25 * (7 + i1));
    }
}

function Get_LinearMap(_Value, _From1, _To1, _From2, _To2)
{
    return (_Value - _From1) / (_To1 - _From1) * (_To2 - _From2) + _From2;
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
        Players_ = _Players;
        Rooms_ = _Rooms;

        Player_ = Players_[PlayerID];
        Room_ = Rooms_[Player_.RoomName];

        if(Room_.State == "Wait")
        {
            background(255);

            if(Room_.Members != undefined)
            {
                for(var i1 in Room_.Members) 
                {
                    var j1 = Players_[Room_.Members[i1]];

                    if(j1.PlayerID == PlayerID)
                    {
                        fill(255, 0, 0);
                    }
                    else
                    {
                        fill(0, 0, 255);
                    }

                    stroke(0);
                    strokeWeight(4);
                    circle(j1.Position.X, j1.Position.Y , j1.Radius);

                    textSize(12);
                    stroke(0);
                    noStroke();
                    fill(0);
                    text("PlayerID: " + j1.PlayerID, j1.Position.X + 15, j1.Position.Y - 12 * 3);
                    text("Name: " + j1.PlayerName, j1.Position.X + 15, j1.Position.Y - 12 * 2);
                }
            }

            Draw_Debug1();
        }
        else if(Room_.State == "Prepare")
        {

        }
        else if(Room_.State == "Play")
        {

        }
    }
});

Socket.on("Impulse", function(_Players, _Rooms) 
{
    if(_Players[PlayerID] != undefined)
    {
        Players_ = _Players;
        Rooms_ = _Rooms;

        Player_ = Players_[PlayerID];
        Room_ = Rooms_[Player_.RoomName];

        if(Room_.State == "Wait")
        {

        }
        else if(Room_.State == "Prepare")
        {
            Get_Card(Count_Hand);

            for(var i1 in Room_.Members)
            {
                var j1 = Players_[Room_.Members[i1]];
        
                
            }

            Draw_Stage();
            Draw_Table();
            Draw_Debug2();

            Socket.emit("Hand", Hand);

            Socket.emit("Change_State", Player_.RoomName, "Play");
        }
        else if(Room_.State == "Play")
        {
            Draw_Stage();
            Draw_Table();
            Draw_Debug2();
        }
    }
});

function keyTyped()
{
    if(Room_.State == "Wait")
    {
        if(KeyToCommand[key] != undefined)
        {
            Movement[KeyToCommand[key]] = true;

            Socket.emit("Movement", Movement);
        }
    }
}
function keyReleased()
{
    if(Room_.State == "Wait")
    {
        if(KeyToCommand[key] != undefined)
        {
            Movement[KeyToCommand[key]] = false;

            Socket.emit("Movement", Movement);
        }
    }
}

function mouseClicked()
{
    if(Room_.State == "Play")
    {
        if(Room_.Turn == PlayerID)
        {
            var Position_Mouse = new Vector2(mouseX, mouseY);

            for(var i1 = 0; i1 < Hand.length; i1++)
            {   
                if(Hand[i1].Check_PointIsOn(Position_Mouse))
                {
                    Index = i1;

                    Draw_Table();

                    break;
                }
            }

            for(var i1 = 0; i1 < Buttons.length; i1++)
            {
                if(Buttons[i1].Check_PointIsOn(Position_Mouse))
                {
                    if(Buttons[i1].ButtonName == "SelectButton")
                    {
                        if(Room_.Type == "Attack" && Index != -1 && Hand[Index].Attack > 0)
                        {
                            console.log(Hand[Index].CardName);

                            Hand.splice(Index, 1);

                            Index = -1;
                    
                            Draw_Table();

                            Socket.emit("Next_Turn", Player_.RoomName, "Defence");
        
                            break;
                        }
                        else if(Room_.Type == "Attack" && Index != -1 && Hand[Index].Heal > 0)
                        {
                            console.log(Hand[Index].CardName);

                            Hand.splice(Index, 1);

                            Index = -1;

                            Draw_Table();

                            Socket.emit("Next_Turn", Player_.RoomName, "Attack");
        
                            break;
                        }
                        else if(Room_.Type == "Defence" && Index != -1 && Hand[Index].Defense > 0)
                        {
                            console.log(Hand[Index].CardName);

                            Hand.splice(Index, 1);

                            Index = -1;

                            Draw_Table();

                            Socket.emit("Next_Turn", Player_.RoomName, "Attack");
        
                            break;
                        }
                    }
                    else if(Buttons[i1].ButtonName == "ThrowAwayButton")
                    {
                        console.log(Hand[Index].CardName);

                        Hand.splice(Index, 1);

                        Index = -1;
                
                        Draw_Table();

                        Socket.emit("Next_Turn", Player_.RoomName, "Attack");
    
                        break;
                    }
                }
            }

            Socket.emit("Hand", Hand);
        }
    }
}

function Get_Card(_Count) 
{   
    for(var i1 = 0; i1 < _Count; i1++) 
    {
        var Cards_ = Cards.slice();
        var Card_ = Cards_[Math.floor(Math.random() * Cards_.length)];

        Hand.unshift(Object.assign(Object.create(Object.getPrototypeOf(Card_)), Card_));
    }

    while(Hand.length > 10)
    {
        Hand.pop();
    }

    Socket.emit("Hand", Hand);
}

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
    Socket.emit("Change_State", Player_.RoomName, "Prepare");
}