// Node/MongoDb Service for Hero 
//
// Purpose: provide restful web api 
//
// Author : Simon Li  July 2020
//
'use strict';

import * as express from 'express';

////////////////////////////////////////////////////////////////////////////
// appRoute.ts
import * as goose from 'mongoose';
import {Promise} from 'bluebird';

const mongo_host: string = process.env.MONGO_HOST || 'localhost';
const database: string   = process.env.DATABASE || "mydatabase";
const mongo_url: string  = `mongodb://${mongo_host}:27017/${database}`;

const options = {useNewUrlParser: true, useUnifiedTopology: true};

const HeroSchema = new goose.Schema({
    id:   { type: Number, required: true },
    name: { type: String, required: true }
});

const response = goose.connect(mongo_url, options, (err) => {  // (err, response)
    if (err) throw err;
    console.dir("connect to MongoDB");
    //console.log(response);
});

// compile schema to model
export const HeroModel = Promise.promisifyAll(goose.model('Heroes', HeroSchema));    
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
        res.send({data: "Welcome to the rest service of Heroes powered by Nodejs/MongoDb."});
    });

    // List all the tasks (GET)
    app.get("/api/heroes", async (req: express.Request, res: express.Response) => {
        try {
    	    let data = await HeroModel.findAsync({}, {_id: 0, __v: 0}); 
            res.send(data);
        }
        catch(ex) {
            res.status(408).send({message: typeof ex === "object"? JSON.stringify(ex) : ex});
        }
    });

    // Get a task per id (GET)
    app.get("/api/heroes/:id", async (req: express.Request, res: express.Response) => {
	    try {
    	    let data = await HeroModel.findAsync({id: req.params.id}, {_id: 0, __v: 0}); 
            res.send({data});
        }
        catch(ex) {
            res.status(408).send({message: typeof ex === "object"? JSON.stringify(ex) : ex});
        }
    })

    // Insert a task (POST)
    app.post("/api/heroes", async (req: express.Request, res: express.Response) => {
        try {
            if (Array.isArray(req.body)) {
                let data = await HeroModel.insertMany(req.body); 
                res.send({data});
            }
            else {    
                let {name, id} = req.body;
                if (!id) id = await HeroModel.countDocumentsAsync({}) + 1;
                console.log({id, name});

                let data = await HeroModel.createAsync({id, name}); 
                res.send({data});
            }   
        }    
        catch(ex) {
            res.status(408).send({message: typeof ex === "object"? JSON.stringify(ex) : ex});
        }
    })

    // Update the task (PUT)
    app.put("/api/heroes", async (req: express.Request, res: express.Response) => {
        console.log(req.body);
	    try {
            let data = await HeroModel.updateOneAsync({ id: req.body.id }, { "$set": req.body});
            res.send({data});
        }
        catch(ex) {
            res.status(408).send({message: typeof ex === "object"? JSON.stringify(ex) : ex});
        }
    })

    // Delete a task (DELETE)
    app.delete("/api/heroes/:id", async (req: express.Request, res: express.Response) => {
        console.log("ID to be deleted: " + req.params.id); // req.body.id)
	    try {
            let data = await HeroModel.deleteOneAsync({ id: req.params.id })
            res.send({data});
        }
        catch(ex) {
            res.status(408).send({message: typeof ex === "object"? JSON.stringify(ex) : ex});
        }
    })
}

///////////////////////////////////////////////////////////////////////////////////////////
const port: number = +process.env.PORT || 8080;

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