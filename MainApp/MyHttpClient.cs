using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace AccountApplication
{
	public class MyHttpClient : IHttpClient
	{

		HttpClient client;

		public MyHttpClient()
		{
			client = new HttpClient();
//#if DEBUG
//			var webProxy = new WebProxy(
//				new Uri("http://127.0.0.1:8888"), 
//				BypassOnLocal: false);

//			var proxyHttpClientHandler = new HttpClientHandler {
//				Proxy = webProxy,
//				UseProxy = true,
//			};
//			client = new HttpClient(proxyHttpClientHandler);
//#else
//			client = new HttpClient();
//#endif

		}

		public void AddDefaultRequestHeader(string key, string value)
		{
			client.DefaultRequestHeaders.Add(key, value);
		}

		public Task<HttpResponseMessage> GetAsync(string url)
		{
			return client.GetAsync(url);
		}

		public Task<HttpResponseMessage> PostAsync(string url, object data)
		{
			return client.PostAsync(url, new ObjectContent(data.GetType(), data, new JsonMediaTypeFormatter(),"application/json") );
		}
	}
}
