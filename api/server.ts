// TS-Node/MongoDb Micro Service for Hero  
//
// Purpose: provide restful web api (CRUD) 
//
// Author : Simon Li  July 2019
//
'use strict';

import * as express from 'express';

////////////////////////////////////////////////////////////////////////////
// appRoute.ts
import * as goose from 'mongoose';
import {Promise} from 'bluebird';

// Easy handling in docker and other runtime
const mongo_host: string     = process.env.MONGO_HOST || 'localhost';
const mongo_port: string     = process.env.MONGO_PORT || '27017';
const mongo_database: string = process.env.MONGO_DATABASE || 'mydatabase';
const mongo_url: string      = `mongodb://${mongo_host}:${mongo_port}/${mongo_database}`;

const options = {useNewUrlParser: true, useUnifiedTopology: true};

// Simple schema for hero data
const HeroSchema = new goose.Schema({
    id:   { type: Number, required: true },
    name: { type: String, required: true }
});

// Connect to the mongo db
const response = goose.connect(mongo_url, options, (err) => {  // (err, response)
    if (err) throw err;
    console.dir("connect to MongoDB");
    //console.log(response);
});

// compile schema to model
export const HeroModel = Promise.promisifyAll(goose.model('Heroes', HeroSchema));    

// Http headers and cors
export default function appRoute(app: express.Application): void {
    app.use((req: express.Request, res: express.Response, next: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', 1);
        next();
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
                
            let data = await HeroModel.findAsync(query, {_id: 0, __v: 0}); 
            res.send(data);
        }
        catch(ex) {
            res.status(408).send({message: "" + ex});
        }
    });

    // Get an individual (GET)
    app.get("/api/heroes/:id", async (req: express.Request, res: express.Response) => {
	    try {
            let data = await HeroModel.findAsync({id: req.params.id}, {_id: 0, __v: 0});
            if (Array.isArray(data))  // Is this one-element array?
                res.send(data[0]);    // direct return the object
            else 
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
                if (!id) id = await HeroModel.countDocumentsAsync({}) + 1;
                console.log({id, name});

                let data = await HeroModel.createAsync({id, name}); 
                res.send({id: data.id, name: data.name});
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
            let data = await HeroModel.updateOneAsync({ id: req.body.id }, { "$set": req.body});
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
            let data = await HeroModel.updateOneAsync({ id: req.body.id }, { "$set": req.body});
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
            let data = await HeroModel.deleteOneAsync({ id: req.params.id })
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

        appRoute(app);
        
        app.listen(port, () => console.log(`dbServer app listening on port ${port}.`));
    }
    catch(ex) {
        console.error(ex);
    }
})();
