using System;
using System.Collections.Generic;
using System.Text;
using AccountApplication.Dal.Model;

namespace AccountApplication.Dal
{
    public interface IUnitOfWork
    {
	    void Save();
	    IGenericRepository<Form> OnlineFormRepository { get; }
		IGenericRepository<Form_question_type> QuestionTypeRepository { get; }
		IGenericRepository<Form_question_rendermethod> RenderMethodRepository { get; }
		IGenericRepository<User> UserRepository { get; }
		IGenericRepository<Form_submission> OnlineFormSubmissionRepository { get; }
	    
    }
}
