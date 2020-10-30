using System;
using System.Collections.Generic;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AccountApplication.Dal;
using AccountApplication.Dal.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AccountApplication.Controllers
{
    [Route("api/[controller]/[action]")]
	[ApiController]
	[Authorize]
    public class UserController : ControllerBase
    {
	    private IUnitOfWork unitOfWork;
	    private IHttpContextAccessor _httpContextAccessor;
	    private IConfiguration _configuration;
	    private IMailHelper _mailHelper;
	    private ICipherService _cipherService;

	    public UserController(IUnitOfWork unitOfWork, IHttpContextAccessor accessor, IConfiguration configuration, IMailHelper mailHelper,
		    ICipherService cipherService)
	    {
		    _cipherService = cipherService;
		    _mailHelper = mailHelper;
		    _configuration = configuration;
		    _httpContextAccessor = accessor;
		    this.unitOfWork = unitOfWork;
	    }

	    [HttpPost]
		[AllowAnonymous]
		[ActionName("register")]
	    public ActionResult<User> PostRegister([FromBody] User user, Guid sessionKey)
	    {
			
			//Check if normal request (prevent api spam)
		    var ipAddress = _httpContextAccessor?.HttpContext?.Connection?.RemoteIpAddress?.ToString();
		    if (string.IsNullOrEmpty(ipAddress))
		    {
			    return BadRequest(new {message = "Unidentified ip address"});
		    }

		    var numOfRequests = Session.CheckRate(ipAddress,
			    DateTime.Now.AddSeconds(-1 * _configuration.GetValue<int>("appSettings:RateLimitPeriodSec")));
		    if (numOfRequests > _configuration.GetValue<int>("appSettings:RateLimitCount"))
			    return Unauthorized();

		    if (Session.Get(sessionKey) == null)
			    return Unauthorized();

		    if (!ValidateRegistrationData(user, out string message))
		    {
			    return BadRequest(new {message});
		    }

		    user.validated = false;
			unitOfWork.UserRepository.Insert(user);
		    unitOfWork.Save();
		    SendValidationMail(user);
		    return Ok();
	    }

	    [HttpPost]
		[AllowAnonymous]
	    [ActionName("validate")]
	    public ActionResult<User> Validate(string id)
	    {
		    var sId = _cipherService.Decrypt(id);
		    if (string.IsNullOrEmpty(sId) || !int.TryParse(sId, out int userId))
		    {
			    return BadRequest(new {message = "Invalid validation id"});
		    }

		    var user = unitOfWork.UserRepository.GetByID(userId);
		    if (user == null)
			    return BadRequest(new {message = "User not found"});
			//login user
			user.Sessions = new List<UserSession>();
		    user.token = GenerateToken(user);
		    user.validated = true;
		    user.Sessions.Add(new UserSession
		    {
			    date = DateTime.Now,
			    token = user.token,
				user_id = user.id,
				ip = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString()
		    });
			unitOfWork.Save();
		    user.password = null;
		    return user;
	    }
	    
		private void SendValidationMail(User user)
		{
			var host = $"{Request.Scheme}://{Request.Host}";
			var id = _cipherService.Encrypt(user.id.ToString());
			var body = "Click the following link to start using your account and fill your application.";
			body += $"<br><a href=\"{host}/validate/{id}\">Click here to activate</a>";
			_mailHelper.SendMail(_configuration.GetValue<string>("appSettings:mail:from"), user.email, "Activate your account", body,
				_configuration.GetValue<string>("appSettings.registrationMailCc"));
		}

		private bool ValidateRegistrationData(User user, out string message)
	    {
		    if (string.IsNullOrEmpty(user.company))
		    {
			    message = "Company name is required.";
			    return false;
		    }

		    if (string.IsNullOrEmpty(user.email))
		    {
			    message = "Email is required.";
			    return false;
		    }

		    if (!Regex.IsMatch(user.email, @"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$",
			    RegexOptions.IgnoreCase))
		    {
			    message = "Invalid email format.";
			    return false;
		    }

		    var email = user.email;
		    if (unitOfWork.UserRepository.Get(u => u.email == email).FirstOrDefault() != null)
		    {
			    message = "User with given email already exists.";
			    return false;
		    }

		    if (string.IsNullOrEmpty(user.password))
		    {
			    message = "Password is required";
			    return false;
		    }

		    message = string.Empty;
		    return true;
	    }

	    [HttpPost]
	    [AllowAnonymous]
	    [ActionName("login")]
	    public ActionResult<User> Login(string email, string password)
	    {
		    var user = LoginUser(email, password);
		    if (user != null)
		    {
			    if (user.validated != true)
				    return BadRequest(new
				    {
					    message = "Account not yet validated. Click on the link in the e-mail to validate your account."
				    });
			    return user;
		    }
		    return BadRequest(new {message = "Invalid email or password"});
	    }

	    [HttpPost]
	    [AllowAnonymous]
	    [ActionName("forgotpass")]
	    public ActionResult ForgotPass(string email)
	    {
		    var user = unitOfWork.UserRepository.Get(u => u.email == email).FirstOrDefault();
		    if (user == null)
			    return BadRequest(new {message = "Email doesn't exist"});
		    var host = $"{Request.Scheme}://{Request.Host}";
		    var id = _cipherService.Encrypt(user.id.ToString());
		    var body = "You requested the password reset.";
		    body += $"<br><a href=\"{host}/resetPassword/{id}\">Click here to reset your password.</a>";
		    _mailHelper.SendMail(_configuration.GetValue<string>("appSettings:mail:from"), user.email, "Password reset request", body,
			    _configuration.GetValue<string>("appSettings.registrationMailCc"));
		    return Ok();
	    }

	    [HttpPost]
	    [AllowAnonymous]
	    [ActionName("checkRecovery")]
	    public ActionResult<User> CheckRecovery(string id)
	    {
		    var sId = _cipherService.Decrypt(id);
		    if (string.IsNullOrEmpty(sId) || !int.TryParse(sId, out int userId))
		    {
			    return BadRequest(new {message = "Invalid data"});
		    }

		    var user = unitOfWork.UserRepository.GetByID(userId);
		    if (user == null)
			    return BadRequest(new {message = "Invalid data"});
		    return Ok();
	    }

	    [HttpPost]
	    [AllowAnonymous]
	    [ActionName("updatePassword")]
	    public ActionResult<User> UpdatePassword(PasswordChange data)
	    {
		    var sId = _cipherService.Decrypt(data.id);
		    if (string.IsNullOrEmpty(sId) || !int.TryParse(sId, out int userId))
		    {
			    return BadRequest(new {message = "Unknown user"});
		    }

		    if (data.password != data.password2)
		    {
			    return BadRequest(new {message = "Passwords don't match"});
		    }

		    var user = unitOfWork.UserRepository.GetByID(userId);
		    user.password = data.password;
			unitOfWork.Save();
		    return Ok();
	    }

	    private User LoginUser(string email, string password)
	    {
		    var user = unitOfWork.UserRepository.Get(u => u.email == email && u.password == password).FirstOrDefault();

		    // return null if user not found
		    if (user == null)
			    return null;
		    user.token = GenerateToken(user);
		    user.password = null;
		    return user;
	    }

	    private string GenerateToken(User user)
	    {
		    var tokenHandler = new JwtSecurityTokenHandler();
		    var key = Encoding.ASCII.GetBytes(_configuration.GetValue<string>("appSettings:tokenSecret"));
		    var tokenDescriptor = new SecurityTokenDescriptor
		    {
			    Subject = new ClaimsIdentity(new Claim[] 
			    {
				    new Claim(ClaimTypes.Email, user.email),
					new Claim(ClaimTypes.PrimarySid, user.id.ToString()),
					new Claim(ClaimTypes.Role, user.isAdmin.ToString())
			    }),
			    Expires = DateTime.UtcNow.AddDays(7),
			    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
		    };
		    var token = tokenHandler.CreateToken(tokenDescriptor);
		    return tokenHandler.WriteToken(token);
	    }
    }

	public class PasswordChange
	{
		public string id { get; set; }
		public string password { get; set; }
		public string password2 { get; set; }
	}
}
