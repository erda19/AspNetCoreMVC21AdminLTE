using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AspNetCoreMVC21AdminLTE.Models;
using AspNetCoreMVC21AdminLTE.devextreme;
using Microsoft.AspNetCore.SignalR;
using AspNetCoreMVC21AdminLTE.SignalR.Hubs;
using Newtonsoft.Json;
namespace AspNetCoreMVC21AdminLTE.Controllers
{
    public class SignalR : Controller
    {
         private readonly IHubContext<Hubs> _hubContext;
        private readonly IList<modeltest> _m;

        private readonly IList<chart> _c;
        public SignalR(IList<modeltest> m, IHubContext<Hubs> hubContext, IList<chart> c)
        {
            _m = m;
            _c = c;
            _hubContext = hubContext;
        }
        public IActionResult Index()
        {
            return View();
        }
        
        public ActionResult MsgPack() {
            
            return View();
        }
        

        [HttpPost()]
        public async Task<ActionResult<modeltest>> Update(modeltest modnew) 
        {
            var m = new List<modeltest>();
            _m.Add(new modeltest(){ID =modnew.ID , CompanyName = modnew.CompanyName });
            //_m.Concat(m);

            await SendNotif(modnew);

            return modnew;
        }

        [HttpPost()]
        public async Task<ActionResult<chart>> UpdateChart(chart _chart) 
        {
            //var m = new List<modeltest>();
            //_m.Add(new modeltest(){ID =modnew.ID , CompanyName = modnew.CompanyName });
            //_m.Concat(m);

            var update = _c.Where(x=>x.id == _chart.id).FirstOrDefault();


            if(update != null)
            {
                _c.Remove(update);
                update.yield = _chart.yield;
                _c.Add(update);
            }

            await SendUpdateChart(_c.OrderBy(x=>x.id).ToList());
            
            return _chart;
        }

        private async Task SendNotif(modeltest t)
        {
            await _hubContext.Clients.All.SendAsync("Notify",JsonConvert.SerializeObject(t));
        }

        
        private async Task SendUpdateChart(List<chart> _chart)
        {
            await _hubContext.Clients.All.SendAsync("UpdateChart", _chart);
        }
        

    }
}