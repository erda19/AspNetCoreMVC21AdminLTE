using AspNetCoreMVC21AdminLTE.SIgnalR;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace AspNetCoreMVC21AdminLTE.SignalR.Hubs
{
    public class Hubs : Hub
    {
        public async Task SendMessage(modelmessage  msg)
        {
            await Clients.All.SendAsync("ReceiveMessage", msg);
        }

        public async Task SendMessageWithMessagePack(modelmessage  msg)
        {
            await Clients.All.SendAsync("ReceiveMessageWithPack", msg);
        }
    }
}