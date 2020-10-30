using System;
using System.Collections.Generic;
using System.Text;
using AccountApplication.Dal.Model;
using Microsoft.EntityFrameworkCore;

namespace AccountApplication.Dal
{
	public class OnlineFormSubmissiontRepository : GenericRepository<Form_submission>
	{
		public OnlineFormSubmissiontRepository(DbContext context) : base(context)
		{
		}

		public override void Update(Form_submission entityToUpdate)
		{
			context.Reconcile(entityToUpdate, e => e.WithMany(x => x.Answers, a => a.WithMany(y => y.QuestionAnswers, 
				qa=>qa.WithMany(x=>x.AnswerChoices).WithMany(x=>x.Files))));
		}
	}
}
