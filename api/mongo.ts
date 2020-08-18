// TS-Node/MongoDb Micro Service for Hero  
//
// Purpose: provide restful web api (CRUD), can be easily extended to Azure Cosmos  
//
// Author : Simon Li  August 2020
//
// https://www.cabotsolutions.com/what-azure-functions-are-and-how-you-can-use-them-to-run-small-applications-effortlessly
// https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-mongoose
'use strict';

import * as express from 'express';

////////////////////////////////////////////////////////////////////////////
// appRoute.ts
import * as mongodb from 'mongodb';
import {Promise} from 'bluebird';

const mongo = Promise.promisifyAll(mongodb);    

// Easy handling in docker and other runtime
const mongo_host: string     = process.env.MONGO_HOST || 'localhost';
const mongo_port: string     = process.env.MONGO_PORT || '27017';

const mongo_url: string      = `mongodb://${mongo_host}:${mongo_port}`;
//const mongo_url = 'mongodb://<username>:<password>@<endpoint>.documents.azure.com:10255/?ssl=true&replicaSet=globaldb';

const mongo_database: string = process.env.MONGO_DATABASE || 'mydatabase';
const collectionName: string = 'heroes';

const options = {useNewUrlParser: true, useUnifiedTopology: true};

// Request routers
export default function appRoute(app: express.Application, HeroModel: any): void {
    
    // Http headers and cors
    app.use((req: express.Request, res: express.Response, next: any) => {
        const allowedOrigins = ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:5000',
                                'http://127.0.0.1:3000', 'http://127.0.0.1:4000', 'http://127.0.0.1:5000'];
        let clientOrigin = req.headers.origin;
        //console.log("Origin", req.headers.origin);    
        if (allowedOrigins.indexOf(clientOrigin) >= 0) 
            res.setHeader('Access-Control-Allow-Origin', clientOrigin);
        else 
            console.log("Client Origin", clientOrigin);

        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.header('Access-Control-Allow-Credentials', '1');
        return next();
    });

    // Dummy root request
    app.get("/", (req: express.Request, res: express.Response) => {
        console.log("root router");
        res.send({data: "Welcome to the rest service of Heroes powered by ts-node/MongoDb."});
    });

    // List all (GET), support /api/heros?name=Dr
    app.get("/api/heroes", async (req: express.Request, res: express.Response) => {
        try {
            let query = {};
            let term = req.query.name;
            if (term) {
                let pattern = { '$regex': `^${term}` };
                query = { 'name': pattern };
                //console.log("Search Term: ", term, query);
            }
            
            let data = await HeroModel.find(query, {projection: {_id: 0, __v: 0}}).toArray(); 
            res.send(data);
        }
        catch(ex) {
            res.status(408).send({message: "" + ex});
        }
    });

    // Get an individual (GET)
    app.get("/api/heroes/:id", async (req: express.Request, res: express.Response) => {
	    try {
            let data = await HeroModel.findOne({id: +req.params.id}, {_id: 0, __v: 0});
            res.send(data);
        }
        catch(ex) {
            res.status(408).send({message: "" + ex});
        }
    })

    // Insert/new one/many (POST)
    app.post("/api/heroes", async (req: express.Request, res: express.Response) => {
        try {
            if (Array.isArray(req.body)) { // insertMany()
                let data = await HeroModel.insertMany(req.body); 
                res.send({data});
            }
            else { // insertOne()   
                let {name, id} = req.body;
                if (!id) id = await HeroModel.countDocuments({}) + 1;
                let newDoc = { id, name };
                console.log(newDoc);

                await HeroModel.insertOne(Object.assign({}, newDoc)); 
                res.send(newDoc); // return the new document
            }   
        }    
        catch(ex) {
            res.status(408).send({message: "" + ex});
        }
    })

    // Update (PUT)
    app.put("/api/heroes", async (req: express.Request, res: express.Response) => {
        console.log(req.body);
	    try {
            let data = await HeroModel.updateOne({ id: +req.body.id }, { "$set": req.body});
            res.send({data});
        }
        catch(ex) {
            res.status(408).send({message: "" + ex});
        }
    })

    // Upadte (PATCH)
    app.patch("/api/heroes", async (req: express.Request, res: express.Response) => {
        console.log(req.body);
	    try {
            let data = await HeroModel.updateOne({ id: +req.body.id }, { "$set": req.body});
            res.send({data});
        }
        catch(ex) {
            res.status(408).send({message: "" + ex });
        }
    })

    // Delete (DELETE)
    app.delete("/api/heroes/:id", async (req: express.Request, res: express.Response) => {
        console.log("ID to be deleted: " + req.params.id); // req.body.id)
	    try {
            let data = await HeroModel.removeOne({ id: +req.params.id })
            res.send({data});
        }
        catch(ex) {
            res.status(408).send({message: "" + ex});
        }
    })
}

///////////////////////////////////////////////////////////////////////////////////////////
const port: number = +process.env.API_PORT || 8080;

// Auto starter
(async () => {
    try {
        const app = express();

        // Parse JSON bodies (as sent by API clients)
        app.use(express.json());

        // Connect to the mongo db
        let client = await mongo.MongoClient.connectAsync(mongo_url, options);
        let db = await client.db(mongo_database);
        let collection = await db.collection(collectionName);

        appRoute(app, collection);
        
        app.listen(port, () => console.log(`dbServer app listening on port ${port}.`));
    }
    catch(ex) {
        console.error(ex);
    }
})();
