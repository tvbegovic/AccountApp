
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace AccountApplication.Dal.Model
{
	
	public partial class Form_question_type
	{
		public int id { get; set; }
		public string name { get; set; }
		public int? default_render_id { get; set; }
		
		public const int shorttext		=	1;
		public const int longtext		=	2;
		public const int singlechoice	=	3;
		public const int multiplechoice	=	4;
		public const int yesno			=	5;
		public const int date			=	6;
		public const int heading		=	7;
		public const int subheading		=	8;
		public const int upload			=	9;

        public virtual Form_question_rendermethod RenderMethod { get; set; }
	
	}
}	
	