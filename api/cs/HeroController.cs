//using System;
using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using System.Text.Json;
using System.Runtime.InteropServices.WindowsRuntime;

// Visual Studio 
// Create Web API project/solution - heroesApi
// NuGet package- install MongoDB.Driver
// Model class - Hero.cs
// Add a controller class - HeroController.cs
// API CRUD routes/http methods/class methods 
namespace heroesApi.Controllers
{
    //[Route("api/[controller]")]
    //[Route("api/heroes")]
    [ApiController]
    public class HeroController : ControllerBase
    {
        static private MongoApi serve = new MongoApi();

        [Route("/")]
        public string Root()
        {
            return "Welcome to the rest service of Heroes powered by c#/MongoDb.";
        }


        [Route("api/heroes")]
        public List<Hero> Get(string name = "")
        {
            List<Hero> heroes = (name == null)? serve.ListDocuments() : serve.SearchDocuments(name);

            //this.Response.ContentType = "Application/json";
            //return JsonSerializer.Serialize(heroes);
            return heroes;
        }

        [Route("api/heroes")]
        [HttpPost]
        public Hero Post([FromBody] Hero hero)
        {
            return serve.Create(hero);
        }

        [Route("api/heroes")]
        [HttpPut, HttpPatch]
        public string Put([FromBody] Hero hero)
        {
            try
            {
                //var hero = JsonSerializer.Deserialize<Hero>(jsonString);
                return JsonSerializer.Serialize(serve.Update(hero.id, hero.name));
            }
            catch(ApiException ex)
            {
                return ex.Message;
            }
        }

        [Route("api/heroes/{id}")]
        [HttpGet]
        public Hero GetById(int id)
        {
            try
            {
                //return JsonSerializer.Serialize(serve.GetById(id));
                return serve.GetById(id);
            }
            catch(ApiException ex)
            {
                return new Hero(-1, "Error: " + ex.Message);
            }
        }

        [Route("api/heroes/{id}")]
        [HttpDelete]
        public string Delete([FromRoute] int id)
        {
            try
            {
                return JsonSerializer.Serialize(serve.Delete(id));
            }
            catch (ApiException ex)
            {
                return ex.Message;
            }

        }
    }
}
