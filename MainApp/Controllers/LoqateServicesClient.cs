using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace AccountApplication.Controllers
{
	public interface ILoqateServicesClient
	{
		List<string> GetAddressMatches(string url, string key, string postcode);
	}

	public class LoqateServicesClient : ILoqateServicesClient
	{
		private IHttpClient httpClient;

		public LoqateServicesClient(IHttpClient httpClient)
		{
			this.httpClient = httpClient;
			
			httpClient.AddDefaultRequestHeader("Accept", "application/json");
		}

		public List<string> GetAddressMatches(string url, string key, string postcode)
		{
		    var data = new
			{
				lqtkey = key,
				input = new[] {new {PostalCode = postcode.ToUpper(), Country = "UK"}},
				suggest = "on"
			};
			var response = httpClient.PostAsync(url, data).Result;
			if (response.StatusCode == HttpStatusCode.OK)
			{
				var output = response.Content.ReadAsAsync<LoqateOutput>().Result;
				return output.Output[0].Select(o => $"{o.Address1}, {o.Address2}, {o.AdministrativeArea}").ToList();
			}

			return null;
		}
	}
	

	public class LoqateOutput
	{
		public LoqateOutputRecord[][] Output { get; set; }
	}

	public class LoqateOutputRecord
	{
		public string AQI { get; set; }
		public string AVC { get; set; }
		public string Address { get; set; }
		public string Address1 { get; set; }
		public string Address2 { get; set; }
		public string Address3 { get; set; }
		public string AdministrativeArea { get; set; }
		public string CountryName { get; set; }
		public string DeliveryAddress { get; set; }
		public string DeliveryAddress1 { get; set; }
		public string Country { get; set; }
		public string Locality { get; set; }
		public string PostalCode { get; set; }
		public string PostalCodePrimary { get; set; }
		public string Premise { get; set; }
		public string PremiseNumber { get; set; }
		public string SearchLevel { get; set; }
		public string SearchMethod { get; set; }
		public int? SearchSimilarity { get; set; }
		public string Thoroughfare { get; set; }
	}
}

