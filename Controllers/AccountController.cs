using Auth0.AuthenticationApi;
using Auth0.AuthenticationApi.Models;
using System;
using System.Collections.Generic;
using System.Compat.Web;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;
using System.Web.Http.Results;

namespace TicketWebAPI.Controllers
{
    public class RetURL
    {
        public string returnUrl { get; set; }
        public string dummy { get; set; }
    }   

    public class AccountController : ApiController
    {
        static Redir_Uri sUri = new Redir_Uri();

        public IHttpActionResult GetAuth0User()
        {
            string name = ClaimsPrincipal.Current.FindFirst("name")?.Value;
            return Ok(name);
        }

        [HttpPost]
        [System.Web.Http.Description.ResponseType(typeof(Redir_Uri))]
        public IHttpActionResult Login(RetURL retUrl)
        {
            var returnUrl = retUrl.returnUrl;
            var client = new AuthenticationApiClient(
                new Uri(string.Format("https://{0}", ConfigurationManager.AppSettings["auth0:Domain"])));


            var request = this.Request;
            var redirectUri = new UriBuilder(request.RequestUri.Scheme, request.RequestUri.Host, this.Request.RequestUri.IsDefaultPort ? -1 : request.RequestUri.Port, "LoginCallback.ashx");

            var authorizeUrlBuilder = client.BuildAuthorizationUrl()
                .WithClient(ConfigurationManager.AppSettings["auth0:ClientId"])
                .WithRedirectUrl(redirectUri.ToString())
                .WithResponseType(AuthorizationResponseType.Code)
                .WithScope("openid profile")
                .WithAudience("https://" + @ConfigurationManager.AppSettings["auth0:Domain"] + "/userinfo");

            if (!string.IsNullOrEmpty(returnUrl))
            {
                var state = "ru=" + HttpUtility.UrlEncode(returnUrl);
                authorizeUrlBuilder.WithState(state);
            }

            sUri.UriStr = authorizeUrlBuilder.Build().ToString();
            return Ok(sUri);
        }

    }
}
