// http://zetcode.com/csharp/httpclient/

using System;
using System.Net;
using System.Collections.Generic;
using System.Net.Http;
using System.Reflection.Metadata;
using System.Threading.Tasks;

using Newtonsoft.Json; // Nuget Package

using JWT.Algorithms;  // Nuget JWT 
using JWT.Builder;    

namespace testHttp
{
    // https://stackoverflow.com/questions/25052293/deserialize-json-to-c-sharp-classes
    class Hero
    {
        [JsonProperty("id")]
        public int id { get; set; }
        [JsonProperty("name")]
        public string name { get; set; }
        public override string ToString()
        {
            return $"id: {id}, name: {name}";
        }
    }

    class Program
    {
        const string EndPoint = "http://localhost:8080/api/heroes";

        static string getIP()
        {
            return new WebClient().DownloadString("http://icanhazip.com").Replace("\n", "");
        }

        static async Task<object> getHeroesOrg()
        {
            using HttpClient client = new HttpClient();
            HttpResponseMessage response = await client.GetAsync(EndPoint);
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            //Console.WriteLine(responseBody);
            var heroes = JsonConvert.DeserializeObject<object>(responseBody);
            return heroes;
        }

        static async Task<List<Hero>> getHeroes()
        {
            using HttpClient client = new HttpClient();
            HttpResponseMessage response = await client.GetAsync(EndPoint);
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            //Console.WriteLine(responseBody);
            List<Hero> heroes = JsonConvert.DeserializeObject<List<Hero>>(responseBody);
            return heroes;
        }

        static async Task<Hero> getHero(int id)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    HttpResponseMessage response = await client.GetAsync($"{EndPoint}/{id}");
                    response.EnsureSuccessStatusCode();
                    string responseBody = await response.Content.ReadAsStringAsync();
                    //Console.WriteLine(responseBody);
                    Hero hero = JsonConvert.DeserializeObject<Hero>(responseBody);
                    return hero;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
            return null;
        }

        static async Task TestGet()
        {
            var heroes = await getHeroesOrg();
            Console.WriteLine(heroes);

            Hero hero = await getHero(2);
            //Console.WriteLine("Type is { 0 }", hero.GetType());
            Console.WriteLine("" + hero);

            List<Hero> heroList = await getHeroes();
            Console.WriteLine();
            foreach (Hero aHero in heroList)
            {
                Console.WriteLine($"<{aHero.id}, {aHero.name}>");
            }
        }

        static async Task createHero(int id, string name)
        {
            Console.WriteLine("Call createHero(int id, string name)");

            Hero hero = new Hero() { id = id, name = name };
            await createHero(hero);
        }
        static async Task createHero(Hero hero)
        {
            Console.WriteLine("Call createHero(Heror hero)");

            using HttpClient client = new HttpClient();
            
            string json = JsonConvert.SerializeObject(hero);
            var stringContent = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await client.PostAsync(EndPoint, stringContent);
            string responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseBody);
        }

        static async Task jwtPost(int id, string name) {
            Console.WriteLine("Call jwtPost(id, name");
            
            Hero hero = new Hero() { id = id, name = name };
            await createHero(hero);
        }

        static async Task jwtPost(Hero hero)
        {
            Console.WriteLine("Call jwtPost(Hero hero");
            
            const string secret = "myHeroes";
            //let hero = { id: 11, name: 'Encrypted'};
            //let token = await jwt.sign({ hero }, secret, { expiresIn: 60 * 5 }) // expires in 5 mins

            string heroJson = JsonConvert.SerializeObject(hero);

            var token = new JwtBuilder()
                      .WithAlgorithm(new HMACSHA256Algorithm())
                      .WithSecret(secret)
                      .AddClaim("hero", heroJson)
                      .Encode(); //.Build();

            var stringContent = new StringContent($"token: {token}", System.Text.Encoding.UTF8, "application/json");

            using HttpClient client = new HttpClient();
            var response = await client.PostAsync(EndPoint, stringContent);
            string responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseBody);
        }

        static async Task Main(string[] args)
        {
            Console.WriteLine($"ip = {getIP()}");

            //await TestGet();
            //await createHero(11, "C# Hero");
            await jwtPost(12, "C# JWT Hero");
        }
    }
}
