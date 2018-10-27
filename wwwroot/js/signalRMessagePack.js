"use strict";
var connection = new signalR.HubConnectionBuilder().withUrl("/Hubs").withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol()).build();



// send with Message pack
connection.on("ReceiveMessageWithPack", function (data) {
    var msg = data.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = data.user + " says " + data.message;
    var li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesListPack").appendChild(li);
});

document.getElementById("sendButtonMsg").addEventListener("click", function (event) {
    var user = document.getElementById("txtUser").value;;
    var message = document.getElementById("txtMessage").value;
    connection.invoke("SendMessageWithMessagePack", { user:user, message : message } ).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});


connection.start().catch(function (err) {
    return console.error(err.toString());
});
