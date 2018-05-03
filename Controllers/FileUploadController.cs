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


    }
}
