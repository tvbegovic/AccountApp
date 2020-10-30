
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;


namespace AccountApplication.Dal.Model
{
	
	public partial class Form_section_question
	{
		public int id { get; set; }
		public int? section_id { get; set; }
		public int? question_group_id { get; set; }
		public int? question_id { get; set; }
		public double? sequence { get; set; }
		public string label { get; set; }
		public bool? required { get; set; }

		//public virtual Form_section Section { get; set; }
        public virtual Form_question_group QuestionGroup { get; set; }
        public virtual Form_question Question { get; set; }

		[NotMapped]
		public Form_submission_answer Answer { get; set; }
		
		

	
	}
}	
	