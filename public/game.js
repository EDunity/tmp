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
        this.CardName = "";
        this.Type = [];
        this.Position = new Vector2(0, 0);
        this.Color = color(255);
        this.Rarity = 0;
        this.Attack = 0;
        this.Defense = 0;
        this.Health = 0;
        this.Shield = 0;
        this.Ammo = 0;
    }

    Draw()
    {
        //Card
        stroke(0);
        strokeWeight(3);
        fill(this.Color);
        rect(this.Position.X, this.Position.Y, Width_Card, Height_Card);

        //CardName
        textAlign(CENTER, CENTER);
        textSize(15);
        stroke(0);
        strokeWeight(1);
        fill(0);
        text(this.CardName, this.Position.X + (Width_Card / 2), this.Position.Y + (15));

        //CardImage
        stroke(0);
        strokeWeight(2);
        fill(100);
        rect(this.Position.X + 10, this.Position.Y + 30, (Width_Card - 20), (Width_Card * 2 / 3 - 20));
    }

    Shadow()
    {
        //Shadow
        stroke(0);
        noStroke();
        fill(0, 50);
        rect(this.Position.X, this.Position.Y, Width_Card, Height_Card);
    }

    Info()
    {
        stroke(0);
        noStroke();
        fill(255);
        rect(mouseX, mouseY, 120, 100);
    }

    Check_PositionIsOn(_Position)
    {
        return this.Position.X < _Position.X && this.Position.X + Width_Card > _Position.X && this.Position.Y < _Position.Y && this.Position.Y + Height_Card > _Position.Y;
    }
}

class Button
{
    constructor() 
    {
        this.ButtonName = "";
        this.Position = new Vector2(0, 0);
        this.Color = color(235);
    }

    Draw()
    {
        //Button
        stroke(0);
        strokeWeight(1);
        fill(this.Color);
        rect(this.Position.X, this.Position.Y, Width_Button, Height_Button);

        //ButtonName
        textSize(15);
        textAlign(CENTER, CENTER);
        stroke(0);
        noStroke();
        fill(0);
        text(this.ButtonName, this.Position.X + (Width_Button / 2), this.Position.Y + (Height_Button / 2));
    }

    Shadow()
    {
        //Shadow
        stroke(0);
        noStroke();
        fill(0, 50);
        rect(this.Position.X, this.Position.Y, Width_Button, Height_Button);
    }

    Check_PositionIsOn(_Position)
    {
        return this.Position.X < _Position.X && this.Position.X + Width_Button > _Position.X && this.Position.Y < _Position.Y && this.Position.Y + Height_Button > _Position.Y;
    }
}

class Unit
{
    constructor()
    {
        this.Position = new Vector2(0, 0);
        this.Color = color(255);
    }

    Draw()
    {
        //Unit
        stroke(0);
        strokeWeight(1);
        fill(this.Color);
        circle(this.Position.X, this.Position.Y, Diameter_Unit);
    }

    Shadow()
    {
        //Shadow
        stroke(0);
        noStroke();
        fill(0, 50);
        circle(this.Position.X, this.Position.Y, Diameter_Unit);
    }

    Info(_Health, _Shield, _Ammo)
    {
        stroke(0);
        noStroke();
        fill(255);
        rect(mouseX, mouseY, 120, 100);

        //Health
        stroke(0);
        noStroke();
        fill(243, 108, 104);
        rect(mouseX + 10, mouseY + 10, _Health, 20);

        stroke(0);
        strokeWeight(1);
        noFill();
        rect(mouseX + 10, mouseY + 10, 100, 20);

        //Shield
        stroke(0);
        noStroke();
        fill(103, 156, 224);
        rect(mouseX + 10, mouseY + 40, _Shield, 20);

        stroke(0);
        strokeWeight(1);
        noFill();
        rect(mouseX + 10, mouseY + 40, 100, 20);

        //Ammo
        stroke(0);
        noStroke();
        fill(241, 196, 15);
        rect(mouseX + 10, mouseY + 70, _Ammo, 20);

        stroke(0);
        strokeWeight(1);
        noFill();
        rect(mouseX + 10, mouseY + 70, 100, 20);
    }

    Check_PositionIsOn(_Position)
    {
        return dist(this.Position.X, this.Position.Y, _Position.X, _Position.Y) < Diameter_Unit / 2;
    }
}

var Socket = io();

var Width_Window = 1024;
var Height_Window = 768;

var Width_Battle = 1024;
var Height_Battle = 640;

var Count_Hand = 10;

//Player
var Health_Player = 100;
var Shield_Player = 100;
var Ammo_Player = 100;

//Card
var Width_Card = 105;// 63mm x 88 mm = 1 : 1.397...
var Height_Card = 145;
var Space_Card = 10;
var Row_Card = Count_Hand / 2;

//Button
var Width_Button = 105;
var Height_Button = 30;
var Space_Button = 10;
var Row_Button = 1;

//Unit
var Diameter_Unit = 30;

//Field
var Count_Point = 7;
var Diameter_Point = 10;
var Count_Dot = 3;
var Diameter_Dot = 5;
var Width_Base = 50;

var SocketID_ = "";
var Players_ = {};
var Rooms_ = {};

var Cards = [];
var Buttons = [];
var Units = [];
var Hand = [];
var Index_Hand = -1;

var States = ["Title", "GameMode", "JoinRoom", "Lobby", "Battle"];

Socket.on("connect", function() 
{   
    Socket.emit("Connect_Game");
});

Socket.on("Update_Info", function(_Players, _Rooms) 
{   
    Players_ = _Players;
    Rooms_ = _Rooms;
});

Socket.on("Change_SocketID", function(_SocketID)
{   
    SocketID_ = _SocketID;

    document.getElementById("PlayerName").value = Players_[SocketID_].PlayerName;

    Change_State("Title");
});
Socket.on("Change_State", function(_State) 
{   
    for(var i1 in States)
    {
        if(States[i1] == _State)
        {
            document.getElementById(States[i1]).style.display = "block";
        }
        else
        {
            document.getElementById(States[i1]).style.display = "none";
        }
    }
});
Socket.on("Change_Show", function() 
{   
    if(SocketID_ in Players_)
    {
        if(Players_[SocketID_].State == "Lobby")
        {
            while(document.getElementById("Players").childElementCount > 0)
            {
                document.getElementById("Players").removeChild(document.getElementById("Player"));
            }

            if(Players_[SocketID_].RoomName in Rooms_)
            {
                // for(var i1 = 0; i1 < Rooms_[Players_[SocketID_].RoomName].Players.length; i1++)
                for(var i1 in Rooms_[Players_[SocketID_].RoomName].Players)
                {
                    var Team = Players_[Rooms_[Players_[SocketID_].RoomName].Players[i1]].Team;

                    var Div1 = document.createElement("div");
                    Div1.className = "Content5";
                    Div1.style.marginTop = "16px";
                    Div1.style.marginLeft = "16px";
                    Div1.id = "Player";
                    document.getElementById("Players").appendChild(Div1);
                
                    var Div2 = document.createElement("div");
                    Div2.className = "Player1";
                    Div2.style.backgroundColor = Team == "Red" ? "rgb(194, 66, 65)" : Team == "Blue" ? "rgb(47, 116, 206)" : "rgb(235, 235, 235)" ;
                    Div1.appendChild(Div2);  

                    var Div3 = document.createElement("div");
                    Div3.className = "Player2";
                    Div2.appendChild(Div3);  

                    var P = document.createElement("p");
                    P.innerHTML = Players_[Rooms_[Players_[SocketID_].RoomName].Players[i1]].PlayerName;
                    Div3.appendChild(P);
                }

                if(Rooms_[Players_[SocketID_].RoomName].Players[0] == SocketID_)
                {
                    document.getElementById("Leader").style.display = "block";
                    document.getElementById("NotLeader").style.display = "none";
                }
                else
                {
                    document.getElementById("Leader").style.display = "none";
                    document.getElementById("NotLeader").style.display = "block";
                }
            }
        }
        else if(Players_[SocketID_].State == "Battle")
        {
            Get_Card(Count_Hand);

            Get_Unit();

            Place_Unit();

            Place_Hand();

            Place_Button();

            Socket.emit("Change_Status", SocketID_, Health_Player / 2, Shield_Player / 2, Ammo_Player / 2);
        }
    }
});

function setup()
{
    createCanvas(Width_Battle, Height_Battle);

    var Card_ = null;

    Card_ = new Card();
    Card_.CardName = "AttackCard";
    Card_.Type = ["Attack"];
    Card_.Color = color(243, 108, 104);
    Card_.Attack = 10;
    Cards.push(Card_);

    Card_ = new Card();
    Card_.CardName = "DefenseCard";
    Card_.Type = ["Defense"];
    Card_.Color = color(103, 156, 224);
    Card_.Defense = 10;
    Cards.push(Card_);

    Card_ = new Card();
    Card_.CardName = "HealCard";
    Card_.Type = ["Heal"];
    Card_.Color = color(95, 211, 143);
    Card_.Health = 10;
    Cards.push(Card_);

    var Button_ = null;

    Button_ = new Button();
    Button_.ButtonName = "Use";
    Buttons.push(Button_);

    Button_ = new Button();
    Button_.ButtonName = "Supply";
    Buttons.push(Button_);

    Button_ = new Button();
    Button_.ButtonName = "Throw Away";
    Buttons.push(Button_);

    Button_ = new Button();
    Button_.ButtonName = "Skip";
    Buttons.push(Button_);

    Button_ = new Button();
    Button_.ButtonName = "Forward";
    Buttons.push(Button_);

    Button_ = new Button();
    Button_.ButtonName = "Back";
    Buttons.push(Button_);

    Button_ = new Button();
    Button_.ButtonName = "Debug";
    Buttons.push(Button_);
}

function draw()
{
    if(SocketID_ in Players_)
    {
        if(Players_[SocketID_].State == "Battle")
        {
            Place_Unit();

            Draw_Field();

            Draw_Unit();

            Draw_Hand();

            Draw_Button();
        }
    }
}

function Place_Unit()
{
    for(var i1 in Units)
    {
        var Space = Width_Battle / (Count_Point + 1);
        var Position = new Vector2((Players_[Rooms_[Players_[SocketID_].RoomName].Order[i1]].Index + 1) * Space, Height_Battle / 4);

        Units[i1].Position = Position.Add(new Vector2(0, -Width_Base));
    } 
}
function Place_Hand()
{
    for(var i1 in Hand)
    {
        var Position = new Vector2((i1 % Row_Card) * Width_Card, floor(i1 / Row_Card) * Height_Card);
        var Space = new Vector2((i1 % Row_Card) * Space_Card + Space_Card, floor(i1 / Row_Card) * Space_Card + Space_Card);
        var Margin = new Vector2(0, (Height_Battle / 2));

        Hand[i1].Position = Position.Add(Space.Add(Margin));
    }
}
function Place_Button()
{
    for(var i1 in Buttons)
    {
        var Position = new Vector2((i1 % Row_Button) * Width_Button, floor(i1 / Row_Button) * Height_Button);
        var Space = new Vector2((i1 % Row_Button) * Space_Button + Space_Button, floor(i1 / Row_Button) * Space_Button + Space_Button);
        var Margin = new Vector2(Width_Battle - Width_Button - Space_Button * 2, (Height_Battle / 2));

        Buttons[i1].Position = Position.Add(Space.Add(Margin));
    }
}

function Draw_Field()
{
    background(255);

    //Table

    stroke(0);
    noStroke();
    fill(235);
    rect(0, 0, Width_Battle, Height_Battle / 2);

    stroke(0);
    noStroke();
    fill(37, 175, 96);
    rect(0, Height_Battle / 2, Width_Battle, Height_Battle / 2);

    for(var i1 = 0; i1 < Count_Hand; i1++)
    {
        var Position = new Vector2((i1 % Row_Card) * Width_Card, floor(i1 / Row_Card) * Height_Card);
        var Space = new Vector2((i1 % Row_Card) * Space_Card + Space_Card, floor(i1 / Row_Card) * Space_Card + Space_Card);
        var Margin = new Vector2(0, (Height_Battle / 2));

        stroke(0);
        noStroke();
        fill(95, 211, 143);
        rect(Position.Add(Space.Add(Margin)).X, Position.Add(Space.Add(Margin)).Y, Width_Card, Height_Card);
    }

    //Stage

    var Side = Rooms_[Players_[SocketID_].RoomName].Side;
    var Turn = Rooms_[Players_[SocketID_].RoomName].Turn;
    var Target = Rooms_[Players_[SocketID_].RoomName].Target;

    var SocketID1 = Rooms_[Players_[SocketID_].RoomName].Order[Turn];
    var SocketID2 = Rooms_[Players_[SocketID_].RoomName].Order[Target];

    var Color1 = Players_[SocketID1].Team == "Red" ? color(243,108,104) : color(103,156,224);
    var Color2 = Players_[SocketID2].Team == "Red" ? color(243,108,104) : color(103,156,224);

    textSize(15);
    textAlign(RIGHT, CENTER);
    stroke(Color1);
    strokeWeight(Side == "A" ? 2 : 1);
    fill(Color1);
    text(Players_[SocketID1].PlayerName, Width_Battle / 2 - 30, 15);

    textSize(15);
    textAlign(CENTER, CENTER);
    stroke(0);
    strokeWeight(0);
    fill(0);
    text("=>", Width_Battle / 2, 15);

    textSize(15);
    textAlign(LEFT, CENTER);
    stroke(Color2);
    strokeWeight(Side == "B" ? 2 : 1);
    fill(Color2);
    text(Players_[SocketID2].PlayerName, Width_Battle / 2 + 30, 15);


    for(var i1 = 0; i1 < Count_Point; i1++)
    {
        var Space1 = Width_Battle / (Count_Point + 1);
        var Position1 = new Vector2((i1 + 1) * Space1, Height_Battle / 4);

        Draw_Point(Position1, Diameter_Point);

        if(i1 != (Count_Point - 1))
        {
            for(var i2 = 0; i2 < Count_Dot; i2++)
            {
                var Space2 = Space1 / (Count_Dot + 1);
                var Position2 = Position1.Add(new Vector2((i2 + 1) * Space2, 0));
    
                Draw_Point(Position2, Diameter_Dot);
            }
        }

        if(i1 == 0)
        {
            var Position3 = Position1.Add(new Vector2(-Width_Base, -Width_Base));

            Draw_Base(Position3, color(194, 66, 65));
        }

        if(i1 == (Count_Point - 1))
        {
            var Position3 = Position1.Add(new Vector2(Width_Base, -Width_Base));

            Draw_Base(Position3, color(47, 116, 206));
        }
    }
}
function Draw_Base(_Position, _Color)
{
    stroke(0);
    strokeWeight(1);
    fill(_Color);
    rect(_Position.X - Width_Base / 2, _Position.Y - Width_Base / 2, Width_Base, Width_Base);
}
function Draw_Point(_Position, _Radius)
{
    stroke(0);
    noStroke();
    fill(0);
    circle(_Position.X, _Position.Y, _Radius);
}
function Draw_Unit()
{
    for(var i1 in Units)
    {
        Units[i1].Draw();

        if(Units[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
        {
            Units[i1].Shadow();
        }
    }

    for(var i1 in Units)
    {
        if(Units[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
        {
            Units[i1].Info(Players_[Rooms_[Players_[SocketID_].RoomName].Order[i1]].Health, Players_[Rooms_[Players_[SocketID_].RoomName].Order[i1]].Shield, Players_[Rooms_[Players_[SocketID_].RoomName].Order[i1]].Ammo);
        }
    }
}
function Draw_Hand()
{
    for(var i1 in Hand)
    {
        Hand[i1].Draw();

        if(Hand[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
        {
            Hand[i1].Shadow();
        }
    }

    for(var i1 in Hand)
    {
        if(Hand[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
        {
            Hand[i1].Info();
        }
    }
}
function Draw_Button()
{
    for(var i1 in Buttons)
    {
        Buttons[i1].Draw();

        if(Buttons[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
        {
            Buttons[i1].Shadow();
        }
    }
}

function Get_Unit()
{   
    Units = [];

    for(var i1 = 0; i1 < Rooms_[Players_[SocketID_].RoomName].Order.length; i1++) 
    {
        var Unit_ = new Unit();
        Unit_.Color = Players_[Rooms_[Players_[SocketID_].RoomName].Order[i1]].Team == "Red" ? color(243,108,104) : color(103,156,224);

        Units.push(Unit_);
    }
}
function Get_Card(_Count) 
{   
    for(var i1 = 0; i1 < _Count; i1++) 
    {
        var Cards_ = Cards.slice();
        var Card_ = Cards_[Math.floor(Math.random() * Cards_.length)];

        // Hand.unshift(Object.assign(Object.create(Object.getPrototypeOf(Card_)), Card_));
        Hand.push(Object.assign(Object.create(Object.getPrototypeOf(Card_)), Card_));

        console.log("Get: (" + i1 + ")" + Object.assign(Object.create(Object.getPrototypeOf(Card_)), Card_).CardName);
    }

    while(Hand.length > 10)
    {
        // Hand.pop();
        Hand.splice(0, 1);
    }

    Socket.emit("Change_Hand", Hand);
}

function Change_PlayerName()
{
    var PlayerName = document.getElementById("PlayerName").value;

    if(PlayerName != "")
    {
        if(PlayerName.length > 30)
        {
            PlayerName = PlayerName.substr(0, 30);
        }

        Change_State("GameMode");

        Socket.emit("Change_PlayerName", PlayerName);
    }
}
function Change_Team(_Team)
{
    Socket.emit("Change_Team", _Team);

    Socket.emit("Change_Index", _Team == "Red" ? 0 : Count_Point - 1);
}
function Change_State(_State)
{
    for(var i1 in States)
    {
        if(States[i1] == _State)
        {
            document.getElementById(States[i1]).style.display = "block";
        }
        else
        {
            document.getElementById(States[i1]).style.display = "none";
        }
    }

    Socket.emit("Change_PlayerState", _State);
}

function Join_Room()
{
    var RoomName = document.getElementById("RoomName").value;

    if(RoomName != "")
    {
        if(RoomName.length > 30)
        {
            RoomName = RoomName.substr(0, 30);
        }

        Change_State("Lobby");

        Socket.emit("Join_Room", RoomName);
    }
}
function Leave_Room()
{
    Socket.emit("Leave_Room");

    Change_State("JoinRoom");
}
function Start_Battle()
{
    if(Rooms_[Players_[SocketID_].RoomName].Players.length >= 2)
    {
        var Ary_Tmp = [];

        for(var i1 in Rooms_[Players_[SocketID_].RoomName].Players)
        {
            Ary_Tmp.push(Players_[Rooms_[Players_[SocketID_].RoomName].Players[i1]].Team);
        }

        if(Ary_Tmp.indexOf("Red") != -1 && Ary_Tmp.indexOf("Blue") != -1 && Ary_Tmp.indexOf("") == -1)
        {
            Socket.emit("Change_Order");

            Socket.emit("Change_Turn");

            Socket.emit("Change_RoomState", "Battle");
        }
    }
}
function GiveUp_Battle()
{
    Socket.emit("Leave_Room");

    Change_State("GameMode");
}

function mouseClicked()
{
    if(Players_[SocketID_].RoomName in Rooms_)
    {
        if(Rooms_[Players_[SocketID_].RoomName].Side == "A")
        {
            if(Rooms_[Players_[SocketID_].RoomName].Turn != -1)
            {
                if(Players_[SocketID_].PlayerName == Players_[Rooms_[Players_[SocketID_].RoomName].Order[Rooms_[Players_[SocketID_].RoomName].Turn]].PlayerName)
                {    
                    for(var i1 in Hand)
                    {
                        if(Hand[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
                        {
                            Place_Hand();
    
                            if(i1 == Index_Hand)
                            {
                                Index_Hand = -1;
            
                                console.log("UnSelect: ");
                            }
                            else
                            {
                                Index_Hand = i1;
            
                                Hand[i1].Position = Hand[i1].Position.Add(new Vector2(0, -20));
            
                                console.log("Select: (" + Index_Hand + ")" + Hand[Index_Hand].CardName);
                            }
                
                            return;
                        }
                    }

                    for(var i1 in Buttons)
                    {
                        if(Buttons[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
                        {
                            if(Buttons[i1].ButtonName == "Use")
                            {
                                if(Index_Hand != -1)
                                {
                                    console.log("Use: (" + Index_Hand + ")" + Hand[Index_Hand].CardName);
    
                                    if(Hand[Index_Hand].Type.indexOf("Attack") != -1)
                                    {
                                        Socket.emit("Change_Value", Hand[Index_Hand].Attack, "Lead");

                                        Socket.emit("Change_Side");

                                        Hand.splice(Index_Hand, 1);
        
                                        Get_Card(1);
        
                                        Place_Hand();
                                    }   
    
                                    if(Hand[Index_Hand].Type.indexOf("Heal") != -1)
                                    {
                                        var SocketID = Rooms_[Players_[SocketID_].RoomName].Order[Rooms_[Players_[SocketID_].RoomName].Target];
                                        var Health = Players_[SocketID].Health + Hand[Index_Hand].Health;
                                        var Shield = Players_[SocketID].Shield;
                                        var Ammo = Players_[SocketID].Ammo;
    
                                        Socket.emit("Change_Status", SocketID, Health, Shield, Ammo);

                                        Socket.emit("Change_Turn");
    
                                        Hand.splice(Index_Hand, 1);
        
                                        Get_Card(1);
        
                                        Place_Hand();
                                    }
    
                                    Index_Hand = -1;
                                }
                            }
                            else if(Buttons[i1].ButtonName == "Supply")
                            {
                                console.log("Supply: ");

                                Socket.emit("Change_Turn");
    
                                Get_Card(1);
    
                                Place_Hand();
    
                                Index_Hand = -1;
                            }
                            else if(Buttons[i1].ButtonName == "Throw Away")
                            {
                                if(Index_Hand != -1)
                                {
                                    console.log("ThrowAway: (" + Index_Hand + ")" + Hand[Index_Hand].CardName);

                                    Socket.emit("Change_Turn");
    
                                    Hand.splice(Index_Hand, 1);
        
                                    Place_Hand();

                                    Index_Hand = -1;
                                }
                            }
                            else if(Buttons[i1].ButtonName == "Forward")
                            {
                                console.log("Forward: ");
    
                                var Index = Players_[SocketID_].Team == "Red" ? Players_[SocketID_].Index + 1 : Players_[SocketID_].Index - 1;
                                Index = constrain(Index, 0, Count_Point - 1);
    
                                Socket.emit("Change_Index", Index);
    
                                Socket.emit("Change_Turn");
                            }
                            else if(Buttons[i1].ButtonName == "Back")
                            {
                                console.log("Back: ");
    
                                var Index = Players_[SocketID_].Team == "Red" ? Players_[SocketID_].Index - 1 : Players_[SocketID_].Index + 1;
                                Index = constrain(Index, 0, Count_Point - 1);
    
                                Socket.emit("Change_Index", Index);
    
                                Socket.emit("Change_Turn");
                            }
                            else if(Buttons[i1].ButtonName == "Debug")
                            {
                                // var Index = Rooms_[Players_[SocketID_].RoomName].Players.indexOf(SocketID_);
    
                                console.log("Team: " + Players_[SocketID_].Team);
                                console.log("Health: " + Players_[SocketID_].Health);
                                console.log("Shield: " + Players_[SocketID_].Shield);
                                console.log("Ammo: " + Players_[SocketID_].Ammo);
                                console.log("Side: " + Rooms_[Players_[SocketID_].RoomName].Side);
                                console.log("Turn: " + Rooms_[Players_[SocketID_].RoomName].Turn);
                                console.log("Target: " + Rooms_[Players_[SocketID_].RoomName].Target);
                            }
            
                            return;
                        }
                    }
    
                    for(var i1 in Units)
                    {
                        if(Units[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
                        {
                            Socket.emit("Change_Target", i1);
                
                            return;
                        }
                    }
                }
            }
        }
        else if(Rooms_[Players_[SocketID_].RoomName].Side == "B")
        {
            if(Rooms_[Players_[SocketID_].RoomName].Target != -1)
            {
                if(Players_[SocketID_].PlayerName == Players_[Rooms_[Players_[SocketID_].RoomName].Order[Rooms_[Players_[SocketID_].RoomName].Target]].PlayerName)
                {    
                    for(var i1 in Hand)
                    {
                        if(Hand[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
                        {
                            Place_Hand();
    
                            if(i1 == Index_Hand)
                            {
                                Index_Hand = -1;
            
                                console.log("UnSelect: ");
                            }
                            else
                            {
                                Index_Hand = i1;
            
                                Hand[i1].Position = Hand[i1].Position.Add(new Vector2(0, -20));
            
                                console.log("Select: (" + Index_Hand + ")" + Hand[Index_Hand].CardName);
                            }
                
                            return;
                        }
                    }

                    for(var i1 in Buttons)
                    {
                        if(Buttons[i1].Check_PositionIsOn(new Vector2(mouseX, mouseY)))
                        {
                            if(Buttons[i1].ButtonName == "Use")
                            {
                                if(Index_Hand != -1)
                                {
                                    console.log("Use: (" + Index_Hand + ")" + Hand[Index_Hand].CardName);
    
                                    if(Hand[Index_Hand].Type.indexOf("Defense") != -1)
                                    {
                                        var SocketID = SocketID_;
                                        var Health = Players_[SocketID].Health - (Rooms_[Players_[SocketID_].RoomName].Value - Hand[Index_Hand].Defense);
                                        var Shield = Players_[SocketID].Shield;
                                        var Ammo = Players_[SocketID].Ammo;
    
                                        Socket.emit("Change_Status", SocketID, Health, Shield, Ammo);

                                        Socket.emit("Change_Value", -1, "");
            
                                        Socket.emit("Change_Turn");

                                        Hand.splice(Index_Hand, 1);
        
                                        Get_Card(1);
        
                                        Place_Hand();
                                    }
    
                                    Index_Hand = -1;
                                }
                            }
                            else if(Buttons[i1].ButtonName == "Skip")
                            {
                                console.log("Skip: ");

                                var SocketID = SocketID_;
                                var Health = Players_[SocketID].Health - Rooms_[Players_[SocketID_].RoomName].Value;
                                var Shield = Players_[SocketID].Shield;
                                var Ammo = Players_[SocketID].Ammo;

                                Socket.emit("Change_Status", SocketID, Health, Shield, Ammo);

                                Socket.emit("Change_Value", -1, "");
    
                                Socket.emit("Change_Turn");

                                Place_Hand();

                                Index_Hand = -1;
                            }
                            else if(Buttons[i1].ButtonName == "Debug")
                            {
                                // var Index = Rooms_[Players_[SocketID_].RoomName].Players.indexOf(SocketID_);
    
                                console.log("Team: " + Players_[SocketID_].Team);
                                console.log("Health: " + Players_[SocketID_].Health);
                                console.log("Shield: " + Players_[SocketID_].Shield);
                                console.log("Ammo: " + Players_[SocketID_].Ammo);
                                console.log("Side: " + Rooms_[Players_[SocketID_].RoomName].Side);
                                console.log("Turn: " + Rooms_[Players_[SocketID_].RoomName].Turn);
                                console.log("Target: " + Rooms_[Players_[SocketID_].RoomName].Target);
                            }
            
                            return;
                        }
                    }
                }
            }
        }
    }
}

function Debug_Hand()
{
    console.log("---------- Hand ----------");

    for(var i1 in Hand) 
    {
        console.log("(" + i1 + ")" + Hand[i1].CardName);
    }

    console.log("--------------------------");
}