using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using AccountApplication.Controllers;
using AccountApplication.Dal;

using MailKit;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing.Constraints;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace AccountApplication
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
	            .AddJsonOptions(
		            opt =>
		            {
			            opt.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
		            });
	        services.AddDbContext<AccountAppContext>(options => 
		        options
			        .UseLazyLoadingProxies()
			        .UseMySQL(Configuration.GetConnectionString("AccountApp")));
	        services.AddScoped<IUnitOfWork, UnitOfWork>();
	        services.AddScoped<MailTransport, SmtpClient>();
	        services.AddScoped<IMailHelper, MailHelper>();
	        services.AddScoped<IRegistryReader, RegistryReader>();
	        services.AddScoped<ICipherService, CipherService>();
	        services.AddScoped<IHttpClient, MyHttpClient>();
	        services.AddScoped<ILoqateServicesClient, LoqateServicesClient>();
	        services.AddDataProtection();
	        services.AddHttpContextAccessor();

	        var key = Encoding.ASCII.GetBytes(Configuration.GetValue<string>("appSettings:tokenSecret"));
	        services.AddAuthentication(x =>
		        {
			        x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
			        x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
		        })
		        .AddJwtBearer(x =>
		        {
			        x.RequireHttpsMetadata = false;
			        x.SaveToken = true;
			        x.TokenValidationParameters = new TokenValidationParameters
			        {
				        ValidateIssuerSigningKey = true,
				        IssuerSigningKey = new SymmetricSecurityKey(key),
				        ValidateIssuer = false,
				        ValidateAudience = false
			        };
		        });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
	        app.UseStaticFiles();
	        app.UseAuthentication();
            app.UseMvc(
	            routes => 
	            {
		            routes.MapRoute("default", "{controller=Home}/{action=Index}/{id?}");
					routes.MapSpaFallbackRoute("spa-fallback", defaults: new {controller="Home", action="Index"});
		            
		            /*routes.MapRoute("react", "{*url}", new
		            {
			            controller = "Home",
			            action = "Index"
		            });*/
	            }
	        );
	        

        }
    }
}
