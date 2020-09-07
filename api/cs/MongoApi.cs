using System;
using System.Collections.Generic;
using System.Linq;
//using System.Threading.Tasks;

using MongoDB.Driver;
using MongoDB.Bson;
//using MongoDB.Driver.Core.Operations;

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
    [Serializable]
    class ApiException : Exception
    {
        public ApiException() { }
       
        public ApiException(string message) : base(message) { }
    }

    public class MongoApi
    {
        private MongoClient dbClient;
        private IMongoDatabase db;
        private IMongoCollection<BsonDocument> collection;

        public string dbName { get; }

        public string collectionName { get; }

        public string dbUri { get; }

        public MongoApi(string host = "localhost", int port = 27017, string dbName = "mydatabase", string collectionName = "heroes")
        {
            try
            {
                dbUri = $"mongodb://{host}:{port}";
                this.dbClient = new MongoClient(dbUri);
                this.dbName = dbName;
                this.collectionName = collectionName;
                this.db = dbClient.GetDatabase(dbName);
                this.collection = db.GetCollection<BsonDocument>(collectionName);
            }
            catch(Exception ex)
            {
                throw new ApiException(ex.Message);
            }
        }

        private List<Hero> parseDocuments(List<BsonDocument> documents)
        {
            List<Hero> heroes = new List<Hero>();
            foreach (BsonDocument doc in documents)
            {
                Hero hero = new Hero();
                hero.id = Convert.ToInt32(doc["id"]);
                hero.name = doc["name"].ToString();

                heroes.Add(hero);
            }
            return heroes;
        }

        public List<Hero> ListDocuments()
        {
            var projection = new BsonDocument { { "_id", 0 }, { "__v", 0 }, { "salt", 0 }, { "password", 0 } };
            var documents = collection.Find(new BsonDocument()).Project(projection).ToList();
            //Console.WriteLine("The list of documents on heroes of mydatabase is: ");

            return parseDocuments(documents);
        }

        public List<Hero> SearchDocuments(string term)
        {
            Console.WriteLine("Search/get");

            var Filter = Builders<BsonDocument>.Filter.Regex("name", "^" + term);
            var documents = collection.Find(Filter).ToList();

            return parseDocuments(documents);
        }

        public Hero Create(string name = "local people")
        {
            try
            {
                Console.WriteLine("Create/post");

                int count = (int)collection.EstimatedDocumentCount();
                int newId = count + 1;
                var document = new BsonDocument { { "id", newId }, { "name", name } };

                collection.InsertOne(document);
                Hero hero = new Hero(newId, name);
                return hero;
            }
            catch(Exception ex)
            {
                throw new ApiException(ex.Message);
            }
        }

        public Hero Create(Hero hero)
        {
            try
            {
                Console.WriteLine("Create/post");
                if (hero.id <= 0)
                {
                    int count = (int)collection.EstimatedDocumentCount();
                    hero.id = count + 1;
                }

                var document = new BsonDocument { { "id", hero.id }, { "name", hero.name } };
                collection.InsertOne(document);

                return hero;
            }
            catch (Exception ex)
            {
                throw new ApiException(ex.Message);
            }
        }

        public UpdateResult Update(int id, string name)
        {
            try
            {
                Console.WriteLine("Update/put");

                var filter = Builders<BsonDocument>.Filter.Eq("id", id);
                var update = Builders<BsonDocument>.Update.Set("name", name);
                var res = collection.UpdateOne(filter, update);

                return res;
            }
            catch (Exception ex)
            {
                throw new ApiException(ex.Message);
            }
        }

        public DeleteResult Delete(int id)
         {
            try
            {
                Console.WriteLine("Delete/delete");

                var deleteFilter = Builders<BsonDocument>.Filter.Eq("id", id);
                var res = collection.DeleteOne(deleteFilter);
                return res;
            }
            catch (Exception ex)
            {
                throw new ApiException(ex.Message);
            }
        }

         public Hero GetById(int id)
         {
            try
            {
                Console.WriteLine("Read/get");

                var filter = Builders<BsonDocument>.Filter.Eq("id", id);
                var document = collection.Find(filter).FirstOrDefault();
                if (document == null)
                    throw new Exception($"id {id} is not existing");

                Hero hero = new Hero();
                hero.id = Convert.ToInt32(document["id"]);
                hero.name = document["name"].ToString();
                return hero;
            }
            catch (Exception ex)
            {
                throw new ApiException(ex.Message);
            }
        }
    }
}