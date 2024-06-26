const Express = require("express");
const Http = require("http");
const Path = require("path");
const SocketIO = require("socket.io");

const App = Express();
const Server = Http.Server(App);
const IO = SocketIO(Server);

class Player
{
    constructor(_ID, _Name, _PosX, _PosY)
    {
        this.ID = _ID;
        this.Name = _Name;
        this.Width = 64;
        this.Height = 64;
        this.PosX = _PosX;
        this.PosY = _PosY;
        this.Movement = {};
    }
};

const Port = process.env.PORT || 3000;
const FrameRate = 60;

const Players = {};

IO.on("connection", function(_Socket) 
{
    let Player_ = null;

    _Socket.on("Setup", function(_Name, _PosX, _PosY) 
    {
        if(_Name != null)
        {
            Player_ = new Player(_Socket.id, _Name, _PosX, _PosY);

            Players[Player_.ID] = Player_;
        }
    });
    
    _Socket.on("Movement", function(_Movement) 
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
            delete Players[Player_.ID];

            Player_ = null;
        }
    });
});

setInterval(function() 
{
    for(const i in Players) 
    {
        if(Players[i].Movement["w"])
        {
            Players[i].PosY -= 5;
        }
        if(Players[i].Movement["s"])
        {
            Players[i].PosY += 5;
        }
        if(Players[i].Movement["d"])
        {
            Players[i].PosX += 5;
        }
        if(Players[i].Movement["a"])
        {
            Players[i].PosX -= 5;
        }
    }

    IO.sockets.emit("Draw", Players);

}, 1000 / FrameRate);

App.use("/public", Express.static(__dirname + "/public"));

App.get("/", (_Request, _Response) => 
{
    _Response.sendFile(Path.join(__dirname, "/public/index.html"));
});

Server.listen(Port, function() 
{
    console.log("Starting Server on port " + Port + ".");
});