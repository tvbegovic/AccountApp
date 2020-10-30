using System;
using System.Collections.Generic;
using System.Text;
using AccountApplication.Dal.Model;
using Microsoft.EntityFrameworkCore;

namespace AccountApplication.Dal
{
    public class UnitOfWork : IUnitOfWork
    {
	    private AccountAppContext context;

	    public UnitOfWork(AccountAppContext context)
	    {
		    this.context = context;
	    }

	    public void Save()
	    {
		    context.SaveChanges();
	    }

	    public IGenericRepository<Form_question_type> QuestionTypeRepository => new GenericRepository<Form_question_type>(context);
	    public IGenericRepository<Form> OnlineFormRepository => new GenericRepository<Form>(context);
	    public IGenericRepository<Form_question_rendermethod> RenderMethodRepository => new GenericRepository<Form_question_rendermethod>(context);
	    public IGenericRepository<User> UserRepository => new GenericRepository<User>(context);
	    public IGenericRepository<Form_submission> OnlineFormSubmissionRepository => new OnlineFormSubmissiontRepository(context);
    }
}
