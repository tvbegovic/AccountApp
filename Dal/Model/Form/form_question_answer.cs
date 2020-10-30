using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccountApplication.Dal.Model
{
    public class form_question_answer
    {
        public int id { get; set; }
        public int? form_submission_answer_id { get; set; }
        public int? question_id { get; set; }
        public int? intValue { get; set; }
        public string textValue { get; set; }
        public DateTime? dateValue { get; set; }
        public string comment_text { get; set; }

        public virtual Form_question Question { get; set; }
        //public virtual List<Form_choice> Choices { get; set; }
		public virtual List<Form_submission_answer_choice> AnswerChoices { get; set; }
		public virtual List<form_question_answer_file> Files { get; set; }

	    [NotMapped]
	    public Validation Validation { get; set; }

    }
	
}
