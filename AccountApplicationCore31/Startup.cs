using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using AccountApplication.Dal;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using MailKit;
using MailKit.Net.Smtp;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Newtonsoft.Json;

namespace AccountApplicationCore31
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
			services.AddControllersWithViews();
						
			services.AddDbContext<AccountAppContext>(options =>
				options
					.UseLazyLoadingProxies()
					.UseMySql(Configuration.GetConnectionString("AccountApp")));
			services.AddScoped<IUnitOfWork, UnitOfWork>();
			services.AddScoped<MailTransport, SmtpClient>();
			services.AddScoped<IMailHelper, MailHelper>();
			services.AddScoped<IRegistryReader, RegistryReader>();
			services.AddScoped<ICipherService, CipherService>();
			services.AddDataProtection();
			services.AddHttpContextAccessor();

			//services.AddSpaStaticFiles(configuration =>
			//{
			//	configuration.RootPath = "wwwroot/dist";
			//});

			services.AddControllers().AddNewtonsoftJson(options =>
			{
				options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
			});

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
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			app.UseHttpsRedirection();

			app.UseRouting();
			//app.UseSpaStaticFiles();
			app.UseStaticFiles();

			app.UseAuthentication();
			app.UseAuthorization();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
				endpoints.MapControllerRoute(
					name: "default",
					pattern: "{controller=Home}/{action=Index}/{id?}");
				endpoints.MapFallbackToController("Index", "Home");
				
			});

			//app.UseSpa(spa =>
			//{
			//	spa.Options.SourcePath = "wwwroot/ReactApp";
				
			//});

		}
	}
}
