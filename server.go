// https://tutorialedge.net/golang/creating-restful-api-with-golang/
// Node/MongoDb Service for Hero 
//
// Purpose: provide restful web api 
//
// Author : Simon Li  July 2020
//
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Must start with a upper case character
type Hero struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

// to simulate a database
var Heroes []Hero

func setHeader(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "X-Requested-With,content-type")
	w.Header().Set("Access-Control-Allow-Credentials", "1")
}

// Method: PUT (PATCH?. MERGE)
func handleApiUpdate(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: api update")

	reqBody, _ := ioutil.ReadAll(r.Body)

	//fmt.Fprintf(w, "%+v", string(reqBody))  // check the data
	var myHero Hero
	json.Unmarshal(reqBody, &myHero)

	// update our global hero
	for index, hero := range Heroes {
		// if our id path parameter matches one of our
		// articles
		if hero.Id == myHero.Id {
			// updates our Heroes array
			var message string
			if hero == myHero {
				message = fmt.Sprintf("{\"status\": %d,\"message\": \"hero %d has not been changed\"}", 200, myHero.Id)
			} else {
				Heroes[index] = myHero
				go dbUpdate(myHero)
				message = fmt.Sprintf("{\"status\": %d,\"message\": \"hero %d has been update\"}", 200, myHero.Id)
			}

			fmt.Fprintf(w, message)
			break // dummy code
		}
	}
}

// Method: DELETE
func handleApiDelete(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: api delete")

	// once again, we will need to parse the path parameters
	vars := mux.Vars(r)
	// we will need to extract the `id` of the article we
	// wish to delete
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		error := strings.ReplaceAll(err.Error(), "\"", "'")
		message := fmt.Sprintf("{\"status\": %d,\"message\": \"%s\"}", 409, error)
		fmt.Fprintf(w, message)
		//fmt.Println(message)
		return
	}

	// we then need to loop through all our articles
	for index, hero := range Heroes {
		// if our id path parameter matches one of our
		// articles
		if hero.Id == id {
			// updates our Heroes array to remove the hero
			Heroes = append(Heroes[:index], Heroes[index+1:]...)
			go dbDelete(id)
			message := fmt.Sprintf("{\"status\": %d,\"message\": \"hero %d has been removed\"}", 200, id)
			fmt.Fprintf(w, message)
			break // dummy code
		}
	}
}

// Method: POST
func handleApiCreate(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: api create")

	// get the body of our POST request
	// return the string response containing the request body
	reqBody, _ := ioutil.ReadAll(r.Body)
	//fmt.Println("reqBody", reqBody)

	//rt := reflect.TypeOf(reqBody)
	//dtype := rt.Kind()
	//fmt.Println("dtype", dtype)
	var heroes []Hero
	var hero Hero
	err := json.Unmarshal(reqBody, &heroes)
	if err != nil {
		json.Unmarshal(reqBody, &hero)
	}

	if len(heroes) > 0 {
		fmt.Println("Endpoint Hit: insertMany")

		// update our global array to include
		// our new element
		Heroes = append(Heroes, heroes...)

		go dbInsertMany(heroes)

		json.NewEncoder(w).Encode(heroes)
	} else {
		fmt.Println("Endpoint Hit: insertOne")
		//fmt.Fprintf(w, "%+v", string(reqBody))  // check the data

		if hero.Id < 1 { // adjust the id if not provided
			hero.Id = len(Heroes) + 1
		}

		// update our global array to include
		// our new element
		Heroes = append(Heroes, hero)

		go dbInsert(hero)

		json.NewEncoder(w).Encode(hero)
	}
}

// Method: GET
func handleApiGet(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: returnSingle")
	vars := mux.Vars(r)
	//key := strconv.Atoi(vars["id"])
	key, err := strconv.Atoi(vars["id"])
	if err != nil {
		error := strings.ReplaceAll(err.Error(), "\"", "'")
		message := fmt.Sprintf("{\"status\": %d,\"message\": \"%s\"}", 409, error)
		fmt.Fprintf(w, message)
		//fmt.Println(message)
		return
	}

	//fmt.Fprintf(w, "Key: " + key)
	//fmt.Println("Key: ", key)
	for _, hero := range Heroes {
		if hero.Id == key {
			json.NewEncoder(w).Encode(hero)
			return
		}
	}

	message := fmt.Sprintf("{\"status\": %d, \"message\": \"Not found data with id: %d\"}", 404, key)
	fmt.Fprintf(w, message)
}

// Method: GET
func handleApiGetDb(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: returnDbSingle")
	vars := mux.Vars(r)
	//key := strconv.Atoi(vars["id"])
	key, err := strconv.Atoi(vars["id"])
	if err != nil {
		error := strings.ReplaceAll(err.Error(), "\"", "'")
		message := fmt.Sprintf("{\"status\": %d,\"message\": \"%s\"}", 409, error)
		fmt.Fprintf(w, message)
		//fmt.Println(message)
		return
	}

	hero, err := dbFind(key)
	if err == nil {
		json.NewEncoder(w).Encode(hero)
		//w.WriteHeader(http.StatusOK)
		return
	}

	message := fmt.Sprintf("{\"status\": %d, \"message\": \"Not found data with id: %d\"}", 404, key)
	fmt.Fprintf(w, message)
}

// Method: GET (Query)
func handleApiQuery(w http.ResponseWriter, r *http.Request) {
	//w.Header().Set("Access-Control-Allow-Origin", "*")
	//if r.Method == http.MethodOptions {
	//    return
	//}
	fmt.Println("Endpoint Hit: returnAll")
	json.NewEncoder(w).Encode(Heroes)

	w.Header().Set("Content-Type", "application/json")
	//w.WriteHeader(http.StatusOK)
}

func homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to the API Home Page powered by go & mongo!")
	fmt.Println("Endpoint Hit: homePage")
}

func handleAll(w http.ResponseWriter, r *http.Request) {
	setHeader(w)
	fmt.Println("Method:", r.Method)

	switch r.Method {
	case http.MethodGet:
		handleApiQuery(w, r)
	case http.MethodPost:
		handleApiCreate(w, r)
	case http.MethodPut:
		handleApiUpdate(w, r)
	}
}

func handleSingle(w http.ResponseWriter, r *http.Request) {
	setHeader(w)

	fmt.Println("Method:", r.Method)
	switch r.Method {
	case http.MethodGet:
		handleApiGet(w, r)
	case http.MethodDelete:
		handleApiDelete(w, r)
	}
}

// Existing code from above
func handleRequests(port int) {
	// creates a new instance of a mux router
	myRouter := mux.NewRouter().StrictSlash(true)

	// replace http.HandleFunc with myRouter.HandleFunc
	myRouter.HandleFunc("/", homePage)

	myRouter.HandleFunc("/api/heroes", handleAll).Methods(http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodOptions)
	myRouter.HandleFunc("/api/heroes/{id}", handleSingle).Methods(http.MethodGet, http.MethodDelete, http.MethodOptions)

	myRouter.Use(mux.CORSMethodMiddleware(myRouter))

	// finally, instead of passing in nil, we want
	// to pass in our newly created router as the second
	// argument
	sPort := fmt.Sprintf(":%d", port)
	//log.Fatal(http.ListenAndServe(":10000", myRouter))
	log.Fatal(http.ListenAndServe(sPort, myRouter))
}

func dbConnect() (*mongo.Client, *mongo.Collection) {
	// Set client options
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")

	// Connect to MongoDB
	client, err := mongo.Connect(context.TODO(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB!")

	dbo := client.Database("mydatabase")
	collection := dbo.Collection("heroes")

	return client, collection
}

func dbClose(client *mongo.Client) {
	err := client.Disconnect(context.TODO())

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connection to MongoDB closed.")
}

func getFromDatabase() {
	// Open up our database connection.
	client, collection := dbConnect()

	// defer the close till after the main function has finished executing
	defer dbClose(client)

	// Execute the query
	// Passing bson.D{{}} as the filter matches all documents in the collection
	// Pass these options to the Find method
	findOptions := options.Find()
	cur, err := collection.Find(context.TODO(), bson.D{{}}, findOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Iterating through the cursor allows us to decode documents one at a time
	for cur.Next(context.TODO()) {
		// create a value into which the single document can be decoded
		var elem Hero
		err := cur.Decode(&elem)
		if err != nil {
			log.Fatal(err)
		}

		Heroes = append(Heroes, elem)
	}

	if err := cur.Err(); err != nil {
		log.Fatal(err)
	}

	// Close the cursor once finished
	cur.Close(context.TODO())

	//fmt.Printf("Found multiple documents (array of pointers): %+v\n", Heroes)
}

func dbFind(id int) (Hero, error) {
	// Open up our database connection.
	client, collection := dbConnect()

	// defer the close till after the function has finished executing
	defer dbClose(client)

	filter := bson.D{{"id", id}}
	//fmt.Println("filer", filter)
	// create a value into which the result can be decoded
	var hero Hero

	err := collection.FindOne(context.TODO(), filter).Decode(&hero)
	fmt.Printf("Found a single document: %+v\n", hero)

	return hero, err
}

func dbInsert(hero Hero) {
	// Open up our database connection.
	client, collection := dbConnect()

	// defer the close till after the function has finished executing
	defer dbClose(client)

	//timestamp := time.Now().Format("2006-01-02 15:04:05")
	//fmt.Println("Timestamp: ", timestamp)

	insertResult, err := collection.InsertOne(context.TODO(), hero)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Inserted a single document: ", insertResult.InsertedID)
}

func dbInsertMany(heroes []Hero) {
	// Open up our database connection.
	client, collection := dbConnect()

	// defer the close till after the function has finished executing
	defer dbClose(client)

	//timestamp := time.Now().Format("2006-01-02 15:04:05")
	//fmt.Println("Timestamp: ", timestamp)

	for _, hero := range heroes {
		insertResult, err := collection.InsertOne(context.TODO(), hero)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("Inserted a single document: ", insertResult.InsertedID)
	}
}

func dbUpdate(hero Hero) {
	// Open up our database connection.
	client, collection := dbConnect()

	// defer the close till after the function has finished executing
	defer dbClose(client)

	filter := bson.D{{"id", hero.Id}}

	update := bson.D{
		{"$set", bson.D{
			{"name", hero.Name},
		},
		},
	}

	updateResult, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Matched %v documents and updated %v documents.\n", updateResult.MatchedCount,
		updateResult.ModifiedCount)
}

func dbDelete(id int) {
	// Open up our database connection.
	client, collection := dbConnect()

	// defer the close till after the function has finished executing
	defer dbClose(client)

	filter := bson.D{{"id", id}}

	deleteResult, err := collection.DeleteOne(context.TODO(), filter)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Deleted %v documents in the heroes collection\n", deleteResult.DeletedCount)
}

func main() {
	fmt.Println("Rest API - Mongo")
	go getFromDatabase()
	//fmt.Println(Heroes)

	port := 8080
	fmt.Println("Server start at port: ", port)
	handleRequests(port)
}
