using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AccountApplicationCore31.Controllers
{
    public class Session
    {
	    private static List<SessionItem> _sessionItems = new List<SessionItem>();

	    public static void Add(SessionItem item)
	    {
		    _sessionItems.Add(item);
	    }

	    public static void Cleanup(DateTime beforeTime)
	    {
		    _sessionItems = _sessionItems.Where(i => i.TimeStamp > beforeTime).ToList();
	    }

		/// <summary>
		/// Checks how many session keys from ip address from given time
		/// </summary>
		/// <param name="ipAddress"></param>
		/// <param name="time"></param>
		/// <returns></returns>
	    public static int CheckRate(string ipAddress, DateTime time)
	    {
		    return _sessionItems.Count(i => i.IpAddress == ipAddress && i.TimeStamp > time);
	    }

	    public static SessionItem Get(Guid key)
	    {
		    return _sessionItems.FirstOrDefault(i => i.Key == key);
	    }
    }

	public class SessionItem
	{
		public Guid Key { get; set; }
		public string IpAddress { get; set; }
		public DateTime TimeStamp { get; set; }
	}
}
