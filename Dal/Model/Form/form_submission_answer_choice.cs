
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;


namespace AccountApplication.Dal.Model
{
	
	public partial class Form_submission_answer_choice
	{
		public int answer_id { get; set; }
		public int choice_id { get; set; }

		[NotMapped]
		public bool selected { get; set; }
		public virtual Form_choice Choice { get; set; }
	
	}
}	
	