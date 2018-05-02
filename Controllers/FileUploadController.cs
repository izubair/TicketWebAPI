using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace TicketWebAPI.Controllers
{
    public class FileUploadController : ApiController
    {
        public static List<string> postedFiles = new List<string>(); 

        [HttpPost]
        public void UploadFile()
        {
            postedFiles.Clear();
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
    }
}
