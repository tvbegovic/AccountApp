using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AccountApplication
{
    public interface IMailer
    {
	    void SendMail(string from, string to, string subject, string body, string cc = null, string bcc = null,
		    System.Net.Mail.Attachment[] attachments = null, string smtpServer = null,
		    string smtpUserName = null, string smtpPassword = null, int smtpServerPortNumber = -1,
		    bool removeCurrentUser = false, string currentUserEmail = null);
    }
}
