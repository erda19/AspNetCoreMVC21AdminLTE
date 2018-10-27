"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/Hubs").build();


connection.on("ReceiveMessage", function (data) {
    var msg = data.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = data.user + " says " + data.message;
    var li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
});


document.getElementById("sendButton").addEventListener("click", function (event) {
    var _user = document.getElementById("user").value;;
    var _message = document.getElementById("messageInput").value;
    
    connection.invoke("SendMessage", { user:_user, message : _message }).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});
