
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace AccountApplication.Dal.Model
{
	
	public partial class Form_question_group
	{
		public int id { get; set; }
		public string name { get; set; }
		public string title { get; set; }
        public string description { get; set; }
		public string layout { get; set; }
        public virtual List<Form_questiongroup_question> Questions { get; set; }
	
	}
}	
	