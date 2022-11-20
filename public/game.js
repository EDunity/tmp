var Socket = io();
var Movement = {};

//ゲーム開始時にGameStart関数を呼ぶ。
Socket.on("connect", GameStart);

function GameStart()
{
    //サーバにゲーム開始を表す"GameStart"メッセージを送る。
    Socket.emit("GameStart", prompt("Please enter your name."));
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
            Movement[Command] = true;
        }
        else if(_Event.type === "keyup")
        {
            Movement[Command] = false;
        }

        Socket.emit("Movement", Movement);
    }
});