
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace AccountApplication.Dal.Model
{
	
	public partial class Form_choicegroup_choice
	{
		public int group_id { get; set; }
		public int choice_id { get; set; }

		public virtual Form_choice Choice { get; set; }
	
	}
}	
	