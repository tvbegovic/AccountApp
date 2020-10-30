
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace AccountApplication.Dal.Model
{
	
	public partial class Form_choice_group
	{
		public int id { get; set; }
		public string name { get; set; }

        //public virtual List<Form_choice> Choices { get; set; }
		public virtual List<Form_choicegroup_choice> GroupChoices { get; set; }
	
	}
	
}	
	