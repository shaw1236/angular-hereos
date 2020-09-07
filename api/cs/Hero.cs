using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//using System.Text.Json;
//using System.Text.Json.Serialization;

// Visual Studio 
// Create Web API project/solution - heroesApi
// NuGet package- install MongoDB.Driver
// Model class - Hero.cs
// Add a controller class - HeroController.cs
// API CRUD routes/http methods/class methods 
namespace heroesApi
{
    public class Hero
    {
        public Hero() {}
        public Hero(int id, string name)
        {
            this.id = id; this.name = name;
        }

        public int id { get; set; }
        public string name { get; set; }
    }
}
