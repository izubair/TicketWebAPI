using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using TweetSharp;

namespace TicketWebAPI.Controllers
{
    public class Redir_Uri
    {
        public string UriStr { get; set; }
        public string UriType { get; set; }
    }

    public class OAuthData
    {
        public string oauth_token { get; set; }
        public string oauth_verifier { get; set; }
    }


    public class SocialLoginController : ApiController
    {
        static Redir_Uri sUri = new Redir_Uri();

        [HttpGet]
        [ResponseType(typeof(Redir_Uri))]
        public IHttpActionResult TwitterAuth()
        {
            string Key = "I4ObconJp84KE97TpZLxmtfOz";
            string Secret = "fuYsBswujZu438WDWVNFvGoj45oszq7YfnKjclX7spqxmNdZB9";

            TwitterService service = new TwitterService(Key, Secret);

            //Obtaining a request token
            OAuthRequestToken requestToken = service.GetRequestToken
                                             ("http://localhost:50728/TwitterCallback.html");

            Uri uri = service.GetAuthenticationUrl(requestToken);

            //Redirecting the user to Twitter Page
            //return Redirect(uri.ToString());
            //Redirect(uri.ToString());

            sUri.UriStr = uri.ToString();

            return Ok(uri.ToString());
        }

        [ResponseType(typeof(TwitterUser))]
        public IHttpActionResult Orig_TwitterCallback(string oauth_token, string oauth_verifier)
        {
            var requestToken = new OAuthRequestToken { Token = oauth_token };

            string Key = "I4ObconJp84KE97TpZLxmtfOz";
            string Secret = "fuYsBswujZu438WDWVNFvGoj45oszq7YfnKjclX7spqxmNdZB9";

            try
            {
                TwitterService service = new TwitterService(Key, Secret);

                //Get Access Tokens
                OAuthAccessToken accessToken =
                           service.GetAccessToken(requestToken, oauth_verifier);

                service.AuthenticateWith(accessToken.Token, accessToken.TokenSecret);

                VerifyCredentialsOptions option = new VerifyCredentialsOptions();

                //According to Access Tokens get user profile details
                TwitterUser user = service.VerifyCredentials(option);

                //return View();
                //return RedirectToAction("Index", "Home");
                Redirect("~/Index.html");

                return Ok(user);

            }
            catch
            {
                throw;
            }
        }

        [ResponseType(typeof(TwitterUser))]
        public IHttpActionResult TwitterCallbackFunc(OAuthData oAuth_Data)
        {
            var requestToken = new OAuthRequestToken { Token = oAuth_Data.oauth_token };

            string Key = "I4ObconJp84KE97TpZLxmtfOz";
            string Secret = "fuYsBswujZu438WDWVNFvGoj45oszq7YfnKjclX7spqxmNdZB9";

            try
            {
                TwitterService service = new TwitterService(Key, Secret);

                //Get Access Tokens
                OAuthAccessToken accessToken =
                           service.GetAccessToken(requestToken, oAuth_Data.oauth_verifier);

                service.AuthenticateWith(accessToken.Token, accessToken.TokenSecret);

                VerifyCredentialsOptions option = new VerifyCredentialsOptions();

                //According to Access Tokens get user profile details
                TwitterUser user = service.VerifyCredentials(option);

                //return View();
                //return RedirectToAction("Index", "Home");
                //Redirect("~/Index.html");

                return Ok(user);

            }
            catch
            {
                throw;
            }
        }
    }
}
