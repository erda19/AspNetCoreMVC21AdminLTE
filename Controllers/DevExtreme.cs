using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DevExtreme.AspNet.Data;
using DevExtreme.AspNet.Mvc;
using AspNetCoreMVC21AdminLTE.devextreme;

namespace AspNetCoreMVC21AdminLTE.Controllers
{
    
    
    public class DevExtremeController : Controller
    {
        
        private readonly IList<modeltest> _m;
        private readonly IList<chart> _c;
        public DevExtremeController(IList<modeltest> m, IList<chart> c)
        {
            _m = m;
            _c = c;
        }
        public ActionResult Index() 
        {
            
            return View();
            
        }

        public ActionResult Chart() {
            return View();
        }
        

        [HttpGet]
        public object GetData(DataSourceLoadOptions loadOptions) {

            //var models = new List<modeltest>();
            // models.Add(new modeltest(){ID = 1, CompanyName = "test123" });
            // models.Add(new modeltest(){ID = 2, CompanyName = "test2" });
            var result = DataSourceLoader.Load(_m, loadOptions);
            return  result;
        }


        //[HttpGet]
        // public object GetDataChart() {

        //     //var models = new List<modeltest>();
        //     // models.Add(new modeltest(){ID = 1, CompanyName = "test123" });
        //     // models.Add(new modeltest(){ID = 2, CompanyName = "test2" });
        //     //var result = DataSourceLoader.Load(_m, loadOptions);
        //     return  result;
        // }
        [HttpGet]
        public object GetDataChart() {
                     
           
           return _c.ToList();

        }
        

    }
}