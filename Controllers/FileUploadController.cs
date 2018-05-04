using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using TicketWebAPI.Models;

namespace TicketWebAPI.Controllers
{
    public class TicAttachedFile
    {
        public string ticID { get; set; }
        public string fileName { get; set; }
        public string filePath { get; set; }
    }

    public class FileUploadController : ApiController
    {
        private ServiceRequestDBEntities db = new ServiceRequestDBEntities();

        public static List<string> postedFiles = new List<string>();

       
        [HttpPost]
        public void UploadFile()
        {            
            if (HttpContext.Current.Request.Files.AllKeys.Any())
            {
                // Get the uploaded image from the Files collection
                
                HttpPostedFile httpPostedFile = HttpContext.Current.Request.Files["UploadedImage"];               
                
                if (httpPostedFile != null)
                {
                    // Validate the uploaded image(optional)
                    if(httpPostedFile.ContentLength > 0)
                    {
                        // Get the complete file path
                        var fileSavePath = Path.Combine(HttpContext.Current.Server.MapPath("~/TempFiles"), httpPostedFile.FileName);
                        // Save the uploaded file to "UploadedFiles" folder
                        httpPostedFile.SaveAs(fileSavePath);
                        postedFiles.Add(httpPostedFile.FileName);
                    }

                    
                }
            }
        }

        public IEnumerable<String> GetTicFileNames()
        {            
            return postedFiles;
        }

        [ResponseType(typeof(String))]
        public IHttpActionResult RemoveTicFile(TicAttachedFile ticFileData)
        {
            postedFiles.Remove(ticFileData.fileName);


            //Session["ticketType"] = 1;

            return Ok("OK");
        }

        [ResponseType(typeof(String))]
        public IHttpActionResult SaveTicFile(TicAttachedFile ticFileData)
        {
            // Also store attachments  
            if (FileUploadController.postedFiles.Count > 0)
            {
                var fileNameUnique = "";
                foreach (var fileName in FileUploadController.postedFiles)
                {
                    var fileSourcePath = Path.Combine(HttpContext.Current.Server.MapPath("~/TempFiles"), fileName);
                    // Get the complete file path
                    fileNameUnique = ticFileData.ticID + fileName;
                    var fileDestPath = Path.Combine(HttpContext.Current.Server.MapPath("~/UploadedFiles"), fileNameUnique);
                    // Save the uploaded file to "UploadedFiles" folder
                    File.Move(fileSourcePath, fileDestPath);
                    // Also store file path in DB
                    TicAttachment ticAttachment = new TicAttachment
                    {
                        //uTic.TicketId = uTic.TicketId;
                        TicketId = Convert.ToInt32(ticFileData.ticID),
                        FilePath = fileDestPath,
                        FileName = fileNameUnique
                    };

                    db.TicAttachments.Add(ticAttachment);
                    db.SaveChanges();
                }
                //var fileName = FileUploadController.postedFiles.First();



                FileUploadController.postedFiles.Clear();
            }


            //Session["ticketType"] = 1;

            return Ok("OK");
        }




    }
}
