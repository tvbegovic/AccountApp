using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace AccountApplication
{
	public interface IHttpClient
	{
		void AddDefaultRequestHeader(string key, string value);
		Task<HttpResponseMessage> GetAsync(string url);
		Task<HttpResponseMessage> PostAsync(string url, object data);
	}
}
