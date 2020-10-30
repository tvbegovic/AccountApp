using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AccountApplication.Dal;
using AccountApplication.Dal.Model;
using Castle.Components.DictionaryAdapter;
using Google.Protobuf.WellKnownTypes;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AccountApplicationCore31.Controllers
{
    [Route("api/[controller]")]
	[ApiController]
	[Authorize]
    public class OnlineFormController : ControllerBase
    {
	    private IUnitOfWork unitOfWork;

		//form_section_question ids for custom validation
	    public const int TradingTypeIdIndex = 11;
	    public const int tradingTypeStartIndex = 35;
	    public const int tradingTypeEndIndex = 39;
	    public const int soleTraderValue = 1;

	    public int? tradingTypeValue = null;
	    private IWebHostEnvironment hostingEnvironment;
	    private IConfiguration _configuration;
	    
	    public const string ValidationRequiredMessage = "Field is required.";


	    public OnlineFormController(IUnitOfWork unitOfWork, IWebHostEnvironment hostingEnvironment,
		    IConfiguration configuration)
	    {
		    
		    _configuration = configuration;
		    this.hostingEnvironment = hostingEnvironment;
		    this.unitOfWork = unitOfWork;
	    }

	    [HttpGet("{id}")]
	    public ActionResult<Formdata> GetForm(int id, int? userId = null, int? submissionId = null)
	    {
		    var user = GetUser();
		    var types = unitOfWork.QuestionTypeRepository.Get().ToList();
		    var uId = userId ?? user?.id;
		    var submission = (submissionId == null ?
			    unitOfWork.OnlineFormSubmissionRepository.Get(s => s.user_id == uId) : 
			    unitOfWork.OnlineFormSubmissionRepository.Get(s => s.id == submissionId)
			    ).FirstOrDefault() ?? new Form_submission{form_id = id};
		    var form = unitOfWork.OnlineFormRepository.Get(f => f.id == id).FirstOrDefault();
			AddAnswersToForm(form, submission);
		    return new Formdata {
			    Types =  types,
			    RenderMethods = unitOfWork.RenderMethodRepository.Get().ToList(),
			    Form = form,
				LastSubmit = submission?.dateCreated,
				Submission = submission
		    };
	    }

	    [HttpGet("submissions/{id}")]
	    public ActionResult<List<Form_submission>> GetSubmissions(int id)
	    {
		    return unitOfWork.OnlineFormSubmissionRepository.Get(s=>s.form_id == id, includeProperties: "User").ToList();
	    }

	    private User GetUser()
	    {
		    var user = new User
		    {
			    email = User.Claims.FirstOrDefault(c=>c.Type == ClaimTypes.Email.ToString())?.Value
		    };
		    if (int.TryParse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid.ToString())?.Value,
			    out int id))
		    {
			    user.id = id;
		    }

		    if (bool.TryParse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role.ToString())?.Value, out bool isAdmin))
		    {
			    user.isAdmin = isAdmin;
		    }

		    return user;
	    }

	    private void AddAnswersToForm(Form form, Form_submission submission)
		{
			var dictAnswers = submission?.Answers?.ToDictionary(a => a.formsection_question_id);
			var sectionQuestions = form.Sections.SelectMany(s => s.Section.Questions).ToList();
			foreach (var sq in sectionQuestions)
			{
				if (dictAnswers != null && dictAnswers.ContainsKey(sq.id))
				{
					sq.Answer = dictAnswers[sq.id];
					foreach (var qa in sq.Answer.QuestionAnswers)
					{
						ProcessAnswerChoices(qa);
					}

					if (sq.QuestionGroup != null)
					{
						//Order answers by group sequence
						sq.Answer.QuestionAnswers = sq.QuestionGroup.Questions.OrderBy(q => q.sequence)
							.Select(q => sq.Answer.QuestionAnswers.FirstOrDefault(x => x.question_id == q.question_id)).ToList();
					}
				}
				else
				{
					sq.Answer = new Form_submission_answer
					{
						formsection_question_id = sq.id,
						QuestionAnswers = sq.Question != null
							? new List<form_question_answer> {CreateEmptyQuestionAnswer(sq.Question)}
							: sq.QuestionGroup?.Questions.OrderBy(x => x.sequence).Select(x => CreateEmptyQuestionAnswer(x.Question)).ToList()
					};
				}

				sq.Answer.Submission = null;
			}
		}

	    private form_question_answer CreateEmptyQuestionAnswer(Form_question q)
	    {
		    return ProcessAnswerChoices(new form_question_answer
		    {
			    question_id = q.id,
				Question = q,
				AnswerChoices = new List<Form_submission_answer_choice>()
			    
		    });
	    }

	    private form_question_answer ProcessAnswerChoices(form_question_answer qa)
	    {
		    qa.AnswerChoices = qa.Question.question_type == Form_question_type.multiplechoice ? qa.Question.ChoiceGroup?.GroupChoices.Select(x =>
			    new Form_submission_answer_choice
			    {
				    choice_id = x.choice_id,
					answer_id = qa.id,
					Choice = new Form_choice
					{
						name = x.Choice?.name
					},
				    selected = qa.AnswerChoices.FirstOrDefault(ac=>ac.choice_id == x.choice_id) != null
			    }).ToList() : null;
		    return qa;
	    }


		[HttpPost]
	    public object SubmitForm(Form_submission s)
	    {
		    if(s != null)
		    {
			    var form = unitOfWork.OnlineFormRepository.Get(f => f.id == s.form_id).FirstOrDefault();
			    var sectionQuestions = form.Sections.SelectMany(x => x.Section.Questions).ToDictionary(x=>(int?) x.id);
			    foreach (var a in s.Answers)
			    {
				    a.SectionQuestion = sectionQuestions.ContainsKey(a.formsection_question_id)
					    ? sectionQuestions[a.formsection_question_id]
					    : null;
			    }
			    if (Validate(s))
			    {
					AdjustSubObjects(s);
				    HandleFiles(s, form);
				    if (s.id <= 0)
				    {
					    s.dateCreated = DateTime.Now;
					    s.user_id = GetUser()?.id;
					    unitOfWork.OnlineFormSubmissionRepository.Insert(s);
				    }
				    else
				    {
					    s.dateUpdated = DateTime.Now;
					    unitOfWork.OnlineFormSubmissionRepository.Update(s);
				    }
			    
				    unitOfWork.Save();
				    return s;
			    }
			    else
			    {
				    return BadRequest(s);
			    }
		    }
		    return null;
	    }

	    

	    private void AdjustSubObjects(Form_submission s)
	    {
		    foreach (var a in s.Answers)
		    {
			    a.SectionQuestion = null;
			    foreach (var qa in a.QuestionAnswers)
			    {
				    qa.Question = null;
				    qa.Validation = null;
				    if (qa.AnswerChoices != null)
				    {
					    qa.AnswerChoices = qa.AnswerChoices.Where(ac => ac.selected)
						    .Select(ac=> new Form_submission_answer_choice
						    {
								answer_id = ac.answer_id,
							    choice_id = ac.choice_id
						    }).ToList();
				    }
					    
			    }
		    }
	    }

	    private void HandleFiles(Form_submission s, Form form)
	    {
		    foreach (var qa in s.Answers.SelectMany(a=>a.QuestionAnswers).Where(x=>x.Files != null && x.Files.Count > 0).ToList())
		    {
			    foreach (var file in qa.Files)
			    {
				    var destFolder = Path.Combine(hostingEnvironment.WebRootPath, "files", GetUser()?.id.ToString());
				    if (!Directory.Exists(destFolder))
					    Directory.CreateDirectory(destFolder);
				    var destPath = Path.Combine(destFolder, file.filename);
				    var data = Base64UrlTextEncoder.Decode(file.data.Substring(28));
					System.IO.File.WriteAllBytes(destPath, data);
			    }
		    }
	    }

	    private bool Validate(Form_submission s)
	    {
		    var result = true;
		    if (s?.Answers != null)
		    {
			    foreach (var ans in s.Answers)
			    {
				    if (ans.SectionQuestion?.required == true)
				    {
					    result = ValidateAnswer(ans) && result;
				    }
			    }
		    }
		    return result;

	    }

	    private bool ValidateAnswer(Form_submission_answer a)
	    {
			//custom case for trading style
		    if (a.formsection_question_id >= tradingTypeStartIndex && a.formsection_question_id <= tradingTypeEndIndex)
		    {
			    a.SectionQuestion.required = tradingTypeValue == soleTraderValue;
		    }

		    if (a.formsection_question_id == TradingTypeIdIndex)
			    tradingTypeValue = a.QuestionAnswers[0].intValue;

		    if (a.SectionQuestion?.Question != null)
			    return a.SectionQuestion?.required != true || ValidateQuestion(a.SectionQuestion?.Question, a.QuestionAnswers[0]);
		    if (a.SectionQuestion?.QuestionGroup != null)
		    {
			    var result = true;
			    var index = 0;
			    foreach (var q in a.SectionQuestion?.QuestionGroup?.Questions)
			    {
				    result = (a.SectionQuestion?.required != true || ValidateQuestion(q.Question, a.QuestionAnswers[index++])) && result;
			    }

			    return result;
		    }

		    return true;
	    }

	    private bool ValidateQuestion(Form_question q, form_question_answer a)
	    {
		    if (q.question_type == Form_question_type.heading || q.question_type == Form_question_type.subheading)
			    return true;
		    var valid = true;
		    if (q.question_type == Form_question_type.shorttext)
				valid = !string.IsNullOrEmpty(a.textValue);
			else if (q.question_type == Form_question_type.date)
			    valid = a.dateValue != null;
		    else if (q.question_type == Form_question_type.singlechoice)
			    valid = a.intValue != null && a.intValue > 0;
		    else if (q.question_type == Form_question_type.multiplechoice)
			    valid = a.AnswerChoices != null && a.AnswerChoices.Any(ac=>ac.selected);
		    a.Validation = new Validation
		    {
			    valid = valid,
			    message = ValidationRequiredMessage
		    };
		    return valid;
	    }

		
    }

	public class Formdata
	{
		public List<Form_question_type> Types { get; set; }
		public List<Form_question_rendermethod> RenderMethods { get; set; }
		public Form Form { get; set; }
		public DateTime? LastSubmit { get; set; }
		public Form_submission Submission { get; set; }
	}
}
