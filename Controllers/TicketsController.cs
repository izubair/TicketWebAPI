using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Script.Serialization;
using TicketWebAPI.Models;

namespace TicketWebAPI.Controllers
{
    public class UserTicket
    {
        public int TicketId { get; set; }
        public string Subject { get; set; }
        public string ConstituentID { get; set; }
        public int Service { get; set; }
        public int IssueId { get; set; }
        public int IssueDetailId { get; set; }
        public int IssueAddInfoId { get; set; }
        public string Description { get; set; }
        public string DateReported { get; set; }
        //public System.TimeSpan TimeReported { get; set; }
        public int TicketStatus { get; set; }
        public int TicketType { get; set; }  // RFS = 1, RFI = 2
    }

    public class TicAttachemntsPath
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string fileName { get; set; }
        public string filePath { get; set; }
    }

    public class Issue
    {
        public int IssueId { get; set; }
        public string Description { get; set; }
    }

    public class IssueDetail
    {
        public int IssueDetailId { get; set; }
        public int IssueId { get; set; }       
        public int DeptID { get; set; }       
        public string Details { get; set; }         
    }

    public class IssueAddInfo
    {
        public int IssueAddInfoId { get; set; }
        public int IssueId { get; set; }
        public int IssueDetailId { get; set; }
        public int DeptID { get; set; }
        public string AdditionalInfo { get; set; }
    }

    public class TicLocation
    {       
        public string Latitude { get; set; }
        public string Longitude { get; set; }        
        public string Address { get; set; }
        public string ParcelNo { get; set; }
        public string CrossSt1 { get; set; }
        public string CrossSt2 { get; set; }
        public string Jurisdiction { get; set; }
    }

    public class TicketsFilter
    {
        public string IssueId { get; set; }
        public string IssueDetailId { get; set; }
        public string IssueAddInfoId { get; set; }
        public string DaysOld { get; set; }       
        public string TicketStatus { get; set; }
    }

    public class TicketsController : ApiController
    {
        private ServiceRequestDBEntities db = new ServiceRequestDBEntities();

        static TicLocation ticketLoc = new TicLocation();

        // GET: api/Tickets
        public IEnumerable<UserTicket> GetTickets()
        {            
            List<UserTicket> ticList = new List<UserTicket>();
            foreach(var tic in db.Tickets)
            {
                UserTicket uTic = new UserTicket();
                uTic.TicketId = tic.TicketId;
                uTic.Subject = tic.Subject;
                uTic.ConstituentID = tic.ConstituentID;
                uTic.Service = tic.Service;
                uTic.IssueId = (int)tic.IssueId;

                uTic.IssueDetailId = (int)tic.IssueDetailId;
                uTic.IssueAddInfoId = (int)tic.IssueAddInfoId;
                uTic.Description = tic.Description;

                uTic.TicketStatus = tic.TicketStatus;    

                if(tic.DateReported != null)
                    uTic.DateReported = ((DateTime)(tic.DateReported + tic.TimeReported)).ToString("yyyyMMddTHH:mm");
               

                ticList.Add(uTic);
            }
            return ticList; 
            //return db.Tickets;
        }

        public IHttpActionResult GetTicketsLatLon()
        {
            object ticLatLng = db.TicketLocations.Select(o => new { o.Latitude, o.Longitude, o.Location });
            //JavaScriptSerializer js = new JavaScriptSerializer();
            //string json_data = js.Serialize(ticLatLng);

            
            return Ok(ticLatLng);
            //return db.Tickets;
        }

        public IHttpActionResult GetTicketsWithLoc()
        {
            object ticketsLoc = from ticket in db.Tickets
                             join ticLoc in db.TicketLocations
                             on ticket.TicketId equals ticLoc.TicketId
                             orderby ticket.DateReported descending, ticket.TimeReported descending
                             select new {ticket.TicketId, ticket.Subject, ticket.Description, ticket.TicketStatus, ticket.DateReported, ticLoc.Latitude, ticLoc.Longitude, ticLoc.Location, ticLoc.ParcelNo};
            //JavaScriptSerializer js = new JavaScriptSerializer();
            //string json_data = js.Serialize(ticLatLng);


            return Ok(ticketsLoc);
            //return db.Tickets;
        }
        public IHttpActionResult GetLast5TicketsWithLoc()
        {
            object ticketsLoc = (from ticket in db.Tickets
                                join ticLoc in db.TicketLocations
                                on ticket.TicketId equals ticLoc.TicketId
                                orderby ticket.DateReported descending, ticket.TimeReported descending
                                select new { ticket.TicketId, ticket.Subject, ticket.Description, ticket.TicketStatus, ticket.DateReported, ticLoc.Latitude, ticLoc.Longitude, ticLoc.Location, ticLoc.ParcelNo }).Take(5); ;
            //JavaScriptSerializer js = new JavaScriptSerializer();
            //string json_data = js.Serialize(ticLatLng);


            return Ok(ticketsLoc);
            //return db.Tickets;
        }
        [HttpPost]
        public IHttpActionResult MapFilteredTickets(TicketsFilter filter)
        {
            var days = filter.DaysOld;

            DateTime ticketDate = DateTime.Now.Date;
            ticketDate = ticketDate.AddDays(-Convert.ToInt32(days));


            string strIssueValue = "";
            int issueID = 1; // First Value
            if (filter.IssueId != null)
            {
                strIssueValue = filter.IssueId;
                issueID = Convert.ToInt32(strIssueValue);
                if (issueID == 0)
                    issueID = 1;
            }

            string strDetailValue;
            int detailID = 0;
            if (filter.IssueDetailId != null)
            {
                strDetailValue = filter.IssueDetailId;
                detailID = Convert.ToInt32(strDetailValue);
            }



            string straddInfoValue;
            int addInfoID = 0;
            if (filter.IssueAddInfoId != null)
            {
                straddInfoValue = filter.IssueAddInfoId;
                addInfoID = Convert.ToInt32(straddInfoValue);
            }


            var ticketStatus = filter.TicketStatus;



            var ticketsFiltered = db.Tickets.Where(o => o.DateReported > ticketDate && o.IssueId == issueID); ;
            if (detailID != 0 && addInfoID != 0)
            {
                ticketsFiltered = ticketsFiltered.Where(o => o.IssueDetailId == detailID && o.IssueAddInfoId == addInfoID);
            }
            else if (detailID != 0)
            {
                // only Issue selected
                ticketsFiltered = ticketsFiltered.Where(o => o.IssueDetailId == detailID);
            }


            object ticketsLoc = from ticket in ticketsFiltered
                                join ticLoc in db.TicketLocations
                                on ticket.TicketId equals ticLoc.TicketId
                                orderby ticket.DateReported descending, ticket.TimeReported descending
                                select new { ticket.TicketId, ticket.Subject, ticket.Description, ticket.TicketStatus, ticket.DateReported, ticLoc.Latitude, ticLoc.Longitude, ticLoc.Location, ticLoc.ParcelNo };
            


            return Ok(ticketsLoc);

        }



        // GET: api/Tickets/5
        [ResponseType(typeof(UserTicket))]
        public IHttpActionResult GetTicket(int id)
        {
            Ticket ticket = db.Tickets.Find(id);
            if (ticket == null)
            {
                return NotFound();
            }
            UserTicket uTic = new UserTicket();
            uTic.TicketId = ticket.TicketId;
            uTic.Subject = ticket.Subject;
            uTic.ConstituentID = ticket.ConstituentID;
            uTic.Service = ticket.Service;
            uTic.IssueId = (int)ticket.IssueId;

            uTic.IssueDetailId = (int)ticket.IssueDetailId;
            uTic.IssueAddInfoId = (int)ticket.IssueAddInfoId;
            uTic.Description = ticket.Description;

            uTic.TicketStatus = ticket.TicketStatus;

            if (ticket.DateReported != null)
                uTic.DateReported = ((DateTime)(ticket.DateReported + ticket.TimeReported)).ToString("yyyyMMddTHH:mm");

            return Ok(uTic);
            //return Ok(ticket);
        }

        // PUT: api/Tickets/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutTicket(int id, Ticket ticket)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != ticket.TicketId)
            {
                return BadRequest();
            }

            db.Entry(ticket).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TicketExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Tickets
        [ResponseType(typeof(UserTicket))]
        [HttpPost]
        public IHttpActionResult PostTicket(UserTicket uTic)
        {
            
            //if (!ModelState.IsValid)
            //{
            //    return BadRequest(ModelState);
            //}

            if(uTic == null)
            {
                return BadRequest(ModelState);
            }

            //JavaScriptSerializer j = new JavaScriptSerializer();
            //UserTicket uTic = (UserTicket)j.Deserialize(uTicStr, typeof(UserTicket));

            

            Ticket ticket = new Ticket();
            //uTic.TicketId = uTic.TicketId;
            ticket.Subject = uTic.Subject;
            ticket.ConstituentID = uTic.ConstituentID;
            ticket.Service = uTic.Service;
            ticket.IssueId = (int)uTic.IssueId;

            ticket.IssueDetailId = (int)uTic.IssueDetailId;
            ticket.IssueAddInfoId = (int)uTic.IssueAddInfoId;
            ticket.Description = uTic.Description;

            ticket.TicketStatus = uTic.TicketStatus;
            ticket.DateReported = DateTime.Now.Date;
            ticket.TimeReported = DateTime.Now.TimeOfDay;

            db.Tickets.Add(ticket);
            db.SaveChanges();
            // Only save location if RFS ticket
            if (uTic.TicketType == 1)
            {
                TicketLocation ticLoc = new TicketLocation();
                ticLoc.Latitude = Convert.ToDouble(ticketLoc.Latitude);
                ticLoc.Longitude = Convert.ToDouble(ticketLoc.Longitude);
                ticLoc.Location = Convert.ToString(ticketLoc.Address);
                ticLoc.ParcelNo = Convert.ToString(ticketLoc.ParcelNo);
                ticLoc.CrossSt1 = Convert.ToString(ticketLoc.CrossSt1);
                ticLoc.CrossSt2 = Convert.ToString(ticketLoc.CrossSt2);
                if (ticLoc.Location.Contains("Henderson"))
                    ticLoc.City = "Henderson";
                else
                    ticLoc.City = "Las Vegas";
                ticLoc.State = "NV";
                // Now use the identity of created ticket 
                ticLoc.TicketId = ticket.TicketId;
                db.TicketLocations.Add(ticLoc);
                db.SaveChanges();
            }

            // Also store attachments  
            if (FileUploadController.postedFiles.Count > 0)
            {
                foreach(var fileName in FileUploadController.postedFiles)
                {
                    var fileSourcePath = Path.Combine(HttpContext.Current.Server.MapPath("~/TempFiles"), fileName);
                    // Get the complete file path
                    var fileDestPath = Path.Combine(HttpContext.Current.Server.MapPath("~/UploadedFiles"), fileName);
                    // Save the uploaded file to "UploadedFiles" folder
                    File.Move(fileSourcePath, fileDestPath);
                    // Also store file path in DB
                    TicAttachment ticAttachment = new TicAttachment
                    {
                        //uTic.TicketId = uTic.TicketId;
                        TicketId = ticket.TicketId,
                        FilePath = fileDestPath,
                        FileName = fileName
                    };

                    db.TicAttachments.Add(ticAttachment);
                    db.SaveChanges();
                }
                //var fileName = FileUploadController.postedFiles.First();

                

                FileUploadController.postedFiles.Clear();
            }

            //return CreatedAtRoute("DefaultApi", new { id = ticket.TicketId }, ticket);
            return Ok("OK");
        }      

        // DELETE: api/Tickets/5
        [ResponseType(typeof(Ticket))]
        public IHttpActionResult DeleteTicket(int id)
        {
            Ticket ticket = db.Tickets.Find(id);
            if (ticket == null)
            {
                return NotFound();
            }

            db.Tickets.Remove(ticket);
            db.SaveChanges();

            return Ok(ticket);
        }

        public IEnumerable<Issue> GetIssues()
        {
            var TicIssuesList = db.Issues.ToList();

            List<Issue> issuesList = new List<Issue>();
            foreach (var issue in TicIssuesList)
            {
                Issue ticIssue = new Issue();
                    
                    ticIssue.IssueId = issue.IssueId;                   
                    ticIssue.Description = issue.Description;
                    issuesList.Add(ticIssue);
            }
            return issuesList;
        }

        public IEnumerable<IssueDetail> GetIssueDetail(int id)
        {
           
            var IssueDetailList = db.IssueDetails.Where(o => o.IssueID == id).ToList();

            List<IssueDetail> issueDetailList = new List<IssueDetail>();
            foreach (var detail in IssueDetailList)
            {
               IssueDetail issueDetail = new IssueDetail();
                    issueDetail.IssueDetailId = detail.IssueDetailId;
                    if (detail.IssueID != null)
                        issueDetail.IssueId = (int)detail.IssueID;
                    if(detail.DeptID != null)
                        issueDetail.DeptID = (int)detail.DeptID;
                    issueDetail.Details = detail.Details;



                    issueDetailList.Add(issueDetail);
            }
            return issueDetailList;           
        }

        public IEnumerable<IssueAddInfo> GetIssueAddInfo(int id, int detailId)
        {
            var IssueInfoList = db.IssueAddInfoes.Where(o => o.IssueID == id && o.IssueDetailID == detailId).ToList();

            List<IssueAddInfo> issueAddInfoList = new List<IssueAddInfo>();
            foreach (var addInfo in IssueInfoList)
            {
                IssueAddInfo issueAddInfo = new IssueAddInfo();
                issueAddInfo.IssueAddInfoId = addInfo.IssueAddInfoId;
                if(addInfo.IssueID != null)
                    issueAddInfo.IssueId = (int)addInfo.IssueID;
                if(addInfo.DeptID != null)
                    issueAddInfo.DeptID = (int)addInfo.DeptID;
                issueAddInfo.AdditionalInfo = addInfo.AdditionalInfo;


                issueAddInfoList.Add(issueAddInfo);
            }
            return issueAddInfoList;
        }
        [ResponseType(typeof(TicLocation))]
        public IHttpActionResult SetTicketData(TicLocation ticLoc)
        {
            
            ticketLoc.Latitude = ticLoc.Latitude;
            ticketLoc.Longitude = ticLoc.Longitude;
            ticketLoc.Address = ticLoc.Address;
            ticketLoc.ParcelNo = ticLoc.ParcelNo;
            ticketLoc.CrossSt1 = ticLoc.CrossSt1;
            ticketLoc.CrossSt2 = ticLoc.CrossSt2;
            ticketLoc.Jurisdiction= ticLoc.Jurisdiction;

            //Session["ticketType"] = 1;

            return Ok("OK");
        }

        //
        [HttpPost]
        public IHttpActionResult GetTicAttachments(UserTicket tic)
        {
            List<TicAttachemntsPath> ticList = new List<TicAttachemntsPath>();

            var currentTicAttachments = db.TicAttachments.Where(o => o.TicketId == tic.TicketId);

            foreach (var ticA in currentTicAttachments)
            {
                TicAttachemntsPath tAttachPath = new TicAttachemntsPath();
                tAttachPath.TicketId = ticA.TicketId;
                tAttachPath.Id = ticA.Id;
                tAttachPath.fileName = ticA.FileName;
                tAttachPath.filePath = ticA.FilePath;



                ticList.Add(tAttachPath);
            }
            return Ok(ticList);
            //return db.Tickets;
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool TicketExists(int id)
        {
            return db.Tickets.Count(e => e.TicketId == id) > 0;
        }
    }
}