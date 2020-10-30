using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AccountApplicationCore31.Controllers
{
    public class HomeController : Controller
    {
	    private readonly IHttpContextAccessor _httpContextAccessor;

	    public HomeController(IWebHostEnvironment env, IHttpContextAccessor accessor)
	    {
		    _httpContextAccessor = accessor;
		    ViewBag.rootPath = env?.WebRootPath;
	    }

        // GET: /<controller>/
        public IActionResult Index()
        {
			//TODO: check only if not authenticated
			
	        var sessionKey = Guid.NewGuid();
			Session.Add(new SessionItem
			{
				Key = sessionKey,
				IpAddress = _httpContextAccessor?.HttpContext?.Connection?.RemoteIpAddress?.ToString(),
				TimeStamp = DateTime.Now
			});
	        ViewBag.sessionKey = sessionKey;
            return View("/Views/Index.cshtml");
        }
    }
}
