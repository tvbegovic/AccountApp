using System;
using System.Collections.Generic;
using System.Text;

namespace AccountApplication.Dal.Model
{
    public class UserSession
    {
		public int id { get; set; }
		public int? user_id { get; set; }
		public DateTime? date { get; set; }
		public string token { get; set; }
		public string ip { get; set; }
    }
}
