using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography.X509Certificates;

using System.Web;
using System.Net;
//using System.Net.Mail;
using System.IO;
using Microsoft.SqlServer.Server;
using Microsoft.Win32;

using System.Text;
using Microsoft.Extensions.Configuration;
using MailKit;
using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;

namespace AccountApplicationCore31
{
    class ErrorMailSending
    {
        public string ErrorMessage { get; set; }
    }
    public class MailHelper : IMailHelper
    {
	    private MailTransport mailer;
	    private readonly IRegistryReader registryReader;
	    private readonly IConfiguration _configuration;

	    public MailHelper(MailTransport mailer, IRegistryReader registryReader, IConfiguration configuration)
	    {
		    _configuration = configuration;
		    this.mailer = mailer;
		    this.registryReader = registryReader;
	    }

        public void SendMail(string from, string to, string subject, string body, string cc = null, string bcc = null,  System.Net.Mail.Attachment[] attachments = null, string smtpServer = null,
                                string smtpUserName = null, string smtpPassword = null, int smtpServerPortNumber = -1, bool removeCurrentUser = false, string currentUserEmail = null)
        {

            var myMessage = new MimeMessage();
            myMessage.From.Add(new MailboxAddress(from));

			if (removeCurrentUser)
			{
				to = RemoveCurrentUser(currentUserEmail, to);
				cc = RemoveCurrentUser(currentUserEmail, cc);
				bcc = RemoveCurrentUser(currentUserEmail, bcc);
			}


			var debugMailReceiver = Convert.ToString(registryReader.GetHKLMValue("SOFTWARE\\BB", "DebugMailReceiver"));
			if (string.IsNullOrEmpty(debugMailReceiver))
				debugMailReceiver = _configuration.GetValue<string>("appSettings:mail:testMails");
			if (string.IsNullOrEmpty(debugMailReceiver))
				debugMailReceiver = null;
#if DEBUG
			try
			{
				myMessage.To.Add(new MailboxAddress(registryReader.GetValue("HKEY_CURRENT_USER\\BB", "DebugMailReceiver").ToString()));
			}
			catch (Exception ex)
			{
				string m1 = string.Format("Email is not valid");
				string m2 = string.Format("E-mail must be supplied (nn@nn.nn)");

				string message =
					$"{ex} Error in sending mail to: {to}   {(string.IsNullOrEmpty(_configuration.GetValue<string>("appSettings:mail:debugMailReceiver")) ? m2 : m1)}";
				throw new Exception(message);
			}

#else
			            var toAddress = debugMailReceiver ?? to;
			            myMessage.To.Add(new MailboxAddress(toAddress));
#endif

			if (!string.IsNullOrEmpty(cc))
			{
#if !DEBUG
			                myMessage.Cc.Add(new MailboxAddress(debugMailReceiver ?? cc));
#endif
			}

			if (!string.IsNullOrEmpty(bcc))
			{
#if !DEBUG
			                myMessage.Bcc.Add(new MailboxAddress(debugMailReceiver ?? bcc));
#endif
			}

			myMessage.Subject = subject;
	        var textPart = new TextPart(TextFormat.Html)
	        {
		        Text = $"<body style=\"font-family: Verdana, arial;font-size:11px\">{body}</body>"
	        };
			if (attachments != null)
			{
				var multipart = new Multipart("mixed") {textPart};
				foreach (var a in attachments)
				{
					var attachment = new MimePart ("image", "gif") {
						Content = new MimeContent(a.ContentStream),
						ContentDisposition = new ContentDisposition (ContentDisposition.Attachment),
						ContentTransferEncoding = ContentEncoding.Base64,
						FileName = a.Name
					};
					multipart.Add (attachment);
				}
				myMessage.Body = multipart;
			}
			else
			{
				myMessage.Body = textPart;
			}

			

#if DEBUG
			textPart.Text += $"<br> Original recipient: {to} CC: {cc}  BCC: {bcc} ";
#else
			            if(!string.IsNullOrEmpty(debugMailReceiver))
			            {
			                textPart.Text += string.Format("<br> Original recipient: {0} CC: {1}  BCC: {2} ", to, cc, bcc);
			            }
#endif
	        if (smtpServer == null)
				smtpServer = _configuration.GetValue<string>("appSettings:mail:server");
			if (smtpUserName == null)
				smtpUserName = _configuration.GetValue<string>("appSettings:mail:account");
			if (smtpPassword == null)
				smtpPassword = _configuration.GetValue<string>("appSettings:mail:password");
	        if (smtpServerPortNumber == -1)
		        smtpServerPortNumber = _configuration.GetValue<int>("appSettings:mail:port");
	        var useSsl = _configuration.GetValue<bool>("appSettings:mail:ssl");

			try
			{
				mailer.ServerCertificateValidationCallback = (s, c, h, e) => true;
				//The last parameter here is to use SSL (Which you should!)
				mailer.Connect(smtpServer, smtpServerPortNumber, useSsl);

				//Remove any OAuth functionality as we won't be using it. 
				mailer.AuthenticationMechanisms.Remove("XOAUTH2");

				if(!string.IsNullOrEmpty(smtpUserName))
					mailer.Authenticate(smtpUserName, smtpPassword);

				mailer.Send(myMessage);

				mailer.Disconnect(true);
			}
			catch (Exception sException)
			{
				string m1 = string.Format("Email is not valid");
				string m2 = string.Format("E-mail must be supplied (nn@nn.nn)");


				string message = $"Error in sending mail to: {to}   {(string.IsNullOrEmpty(to) ? m2 : m1)}";
				throw new Exception(message, sException);

			}

		}

        private static void MySmtpClient_SendCompleted(object sender, System.ComponentModel.AsyncCompletedEventArgs e)
        {
            
        }

        private static string RemoveCurrentUser(string currentUserEmail, string mailAddresses)
        {
            var parts = mailAddresses.Split(',');
            if (currentUserEmail != null && mailAddresses != currentUserEmail)
                return string.Join(",", parts.Where(p => p.Trim() != currentUserEmail));
            return string.Join(",", parts);
        }

        
    }
}