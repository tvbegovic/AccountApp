
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;


namespace AccountApplication.Dal.Model
{
	
	public partial class Form_submission_answer
	{
		public int id { get; set; }
		public int? submission_id { get; set; }
		public int? formsection_question_id { get; set; }
        	
	    public virtual List<form_question_answer> QuestionAnswers { get; set; }
        public virtual Form_submission Submission { get; set; }
        public virtual Form_section_question SectionQuestion { get; set; }
     
	}
}	
	