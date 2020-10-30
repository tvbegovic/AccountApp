using System;
using System.Collections.Generic;
using System.Text;
using AccountApplication.Dal.Mappings;
using AccountApplication.Dal.Model;
using Microsoft.EntityFrameworkCore;

namespace AccountApplication.Dal
{
    public class AccountAppContext : DbContext
    {
	    public AccountAppContext(DbContextOptions options) : base(options)
	    {

	    }
	    
	    protected override void OnModelCreating(ModelBuilder modelBuilder)
	    {

		    modelBuilder.Entity<Form_choicegroup_choice>().HasKey(e => new {e.choice_id, e.group_id});
		    modelBuilder.Entity<Form_choicegroup_choice>().HasOne(x => x.Choice).WithMany().HasForeignKey(x => x.choice_id);
		    modelBuilder.Entity<Form_submission_answer_choice>().HasKey(ac => new {ac.answer_id, ac.choice_id});
		    modelBuilder.Entity<Form_submission_answer_choice>().HasOne(ac => ac.Choice).WithMany()
			    .HasForeignKey(ac => ac.choice_id);
		    modelBuilder.Entity<User>().Property(u => u.validated).HasConversion<int?>();
		    modelBuilder.Entity<User>().HasMany(u => u.Sessions).WithOne().HasForeignKey(s => s.user_id);
		    modelBuilder.Entity<User>().Property(u => u.isAdmin).HasConversion<int?>();
		    modelBuilder.Entity<UserSession>().ToTable("user_session");

		    modelBuilder.ApplyConfiguration(new FormMappings());
		    modelBuilder.ApplyConfiguration(new FormSectionMappings());
		    modelBuilder.ApplyConfiguration(new FormChoiceGroupMappings());
		    modelBuilder.ApplyConfiguration(new FormQuestionGroupMappings());
		    modelBuilder.ApplyConfiguration(new FormQuestionTypeMappings());
		    modelBuilder.ApplyConfiguration(new FormQuestionMappings());
		    modelBuilder.ApplyConfiguration(new FormSectionQuestionMappings());
		    modelBuilder.ApplyConfiguration(new FormSubmissionAnswerMappings());
		    modelBuilder.ApplyConfiguration(new FormSubmissionMappings());
		    modelBuilder.ApplyConfiguration(new FormFormSectionMappings());
		    modelBuilder.ApplyConfiguration(new FormQuestionGroupQuestionMappings());
		    modelBuilder.ApplyConfiguration(new FormQuestionAnswerMappings());
		    
	    }

	    
    }
}
