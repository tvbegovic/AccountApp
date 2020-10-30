using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace AccountApplication.Dal.Model
{
    public class User
    {
		public int id { get; set; }
		public string company { get; set; }
		public string password { get; set; }
		public string email { get; set; }
		public bool? isAdmin { get; set; }
		[NotMapped]
		public string token { get; set; }
		public bool? validated { get; set; }

		public virtual  List<UserSession> Sessions { get; set; }

    }
}
