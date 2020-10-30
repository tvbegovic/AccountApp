
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace AccountApplication.Dal.Model
{
	
	public partial class Form_section
	{
		public int Id { get; set; }
		//public int? form_id { get; set; }
		public string title { get; set; }

        //public Form Form { get; set; }
        public virtual List<Form_section_question> Questions { get; set; }
	
	}
}	
	