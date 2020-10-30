using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace AccountApplication.Dal.Model
{
	public class form_question_answer_file
	{
		public int id { get; set; }
		public int? form_question_answer_id { get; set; }
		public string filename { get; set; }

		[NotMapped]
		public string data { get; set; }
	}
}
