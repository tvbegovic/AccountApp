
using System;
using System.Collections.Generic;

using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccountApplication.Dal.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace AccountApplication.Dal.Mappings
{
    public class FormMappings : IEntityTypeConfiguration<Form>
    {   
	    public void Configure(EntityTypeBuilder<Form> builder)
	    {
		    builder.ToTable("form");
		    builder.HasMany(f => f.Sections).WithOne(s => s.Form).HasForeignKey(s => s.form_id);
		    builder.HasMany(f => f.Submissions).WithOne(s=>s.Form).HasForeignKey(s => s.form_id);
	    }
    }

    public class FormFormSectionMappings : IEntityTypeConfiguration<Form_formsection>
    {
        public void Configure(EntityTypeBuilder<Form_formsection> builder)
	    {
		    builder.ToTable("Form_formsection");
		    builder.HasKey(f => new { f.form_id, f.section_id });
		    builder.HasOne(f => f.Section).WithMany().HasForeignKey(f => f.section_id);
	    }
    }

    public class FormSectionMappings : IEntityTypeConfiguration<Form_section>
    {
        public void Configure(EntityTypeBuilder<Form_section> builder)
	    {
			builder.ToTable("form_section");
		    //builder.HasKey(s => s.Id);
		    builder.HasMany(f => f.Questions).WithOne().HasForeignKey(q => q.section_id);   
	    }
    }

    public class FormSectionQuestionMappings : IEntityTypeConfiguration<Form_section_question>
    {
        public void Configure(EntityTypeBuilder<Form_section_question> builder)
	    {
		    builder.ToTable("Form_section_question");
		    builder.HasOne(s => s.QuestionGroup).WithMany().HasForeignKey(s => s.question_group_id);
		    builder.HasOne(s => s.Question).WithMany().HasForeignKey(s => s.question_id);
		    builder.Property(u => u.required).HasConversion<int?>();
	    }
    }

    public class FormQuestionMappings : IEntityTypeConfiguration<Form_question>
    {
        public void Configure(EntityTypeBuilder<Form_question> builder)
	    {
		    builder.ToTable("Form_question");
		    builder.HasOne(q => q.ChoiceGroup).WithMany().HasForeignKey(q => q.choice_group_id);
		    builder.HasOne(q => q.QuestionRenderMethod).WithMany().HasForeignKey(q => q.render_id);
		    builder.HasOne(q => q.QuestionType).WithMany().HasForeignKey(q => q.question_type);
		    //builder.HasMany(q => q.QuestionGroups).WithOne(g => g.Question).HasForeignKey(g => g.question_id);
		    builder.Property(q => q.has_comment).HasConversion<int?>();
		    builder.Property(q => q.label_editable).HasConversion<int?>();
		    builder.Property(q => q.autocomplete).HasConversion<int?>();
	    }
    }

    public class FormChoiceGroupMappings : IEntityTypeConfiguration<Form_choice_group>
    {
        public void Configure(EntityTypeBuilder<Form_choice_group> builder)
	    {
			builder.ToTable("Form_choice_group");
		    builder.HasMany(f => f.GroupChoices).WithOne().HasForeignKey(c => c.group_id);
	    }
    }

    public class FormQuestionGroupMappings : IEntityTypeConfiguration<Form_question_group>
    {
        public void Configure(EntityTypeBuilder<Form_question_group> builder)
	    {
		    builder.ToTable("Form_question_group");
		    builder.HasMany(g => g.Questions).WithOne().HasForeignKey(q => q.group_id);
	    }
    }

    public class FormQuestionGroupQuestionMappings : IEntityTypeConfiguration<Form_questiongroup_question>
    {
        public void Configure(EntityTypeBuilder<Form_questiongroup_question> builder)
	    {
		    builder.HasKey(f => new { f.question_id, f.group_id });
		    builder.HasOne(f => f.Question).WithMany().HasForeignKey(f => f.question_id);
	    }
    }

    public class FormSubmissionMappings : IEntityTypeConfiguration<Form_submission>
    {
       
	    public void Configure(EntityTypeBuilder<Form_submission> builder)
	    {
		    builder.ToTable("Form_submission");
		    builder.HasMany(s => s.Answers).WithOne(a => a.Submission).HasForeignKey(a => a.submission_id);
		    builder.HasOne(s => s.User).WithMany().HasForeignKey(s => s.user_id);
	    }
    }

    public class FormQuestionAnswerMappings: IEntityTypeConfiguration<form_question_answer>
    {
        
	    public void Configure(EntityTypeBuilder<form_question_answer> builder)
	    {
		    builder.HasMany(f => f.AnswerChoices).WithOne().HasForeignKey(ac => ac.answer_id);
		    builder.HasOne(f => f.Question).WithMany().HasForeignKey(f => f.question_id);
		    builder.HasMany(f => f.Files).WithOne().HasForeignKey(f => f.form_question_answer_id);
	    }
    }

    public class FormSubmissionAnswerMappings : IEntityTypeConfiguration<Form_submission_answer>
    {
        public void Configure(EntityTypeBuilder<Form_submission_answer> builder)
	    {
		    builder.ToTable("Form_submission_answer");            
		    builder.HasOne(a => a.SectionQuestion).WithMany().HasForeignKey(a => a.formsection_question_id);
		    builder.HasMany(a => a.QuestionAnswers).WithOne().HasForeignKey(qa => qa.form_submission_answer_id);
	    }
    }

    public class FormQuestionTypeMappings : IEntityTypeConfiguration<Form_question_type>
    {
	    public void Configure(EntityTypeBuilder<Form_question_type> builder)
	    {
		    builder.ToTable("Form_question_type");
		    builder.HasOne(t => t.RenderMethod).WithMany().HasForeignKey(t => t.default_render_id);
	    }
    }

}
