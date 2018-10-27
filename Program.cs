﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AspNetCoreMVC21AdminLTE
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                  
                    // .UseKestrel(
                    //     options =>
                    //     {
                    //         options.Listen(System.Net.IPAddress.Any, 7000);
                    //         options.Listen(System.Net.IPAddress.Any, 7001,
                    //         listenOptions =>
                    //         {
                    //             listenOptions.UseHttps();
                    //         });
                    //     }
                    // )
                    .UseStartup<Startup>();
                    
    }
    
}
