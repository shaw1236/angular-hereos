// Node/MongoDb Service for tasks 
//
// Purpose: provide restful web api 
//
// Author : Simon Li  July 2020
//
'use strict';

const express = require('express');
const goose = require('mongoose');
const {Promise} = require('bluebird');

const HeroSchema = new goose.Schema({
    id:   { type: Number, required: true },
    name: { type: String, required: true }
});

const mongo_host = process.env.MONGO_HOST || 'localhost';
const mongo_url = `mongodb://${mongo_host}:27017/mydatabase`
const options = {useNewUrlParser: true, useUnifiedTopology: true};

const port = +process.env.PORT || 8080;

const appRoute = (app, HeroModel) => {
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });

    // Dummy root request
    app.get("/", (req, res) => {
        console.log("root router");
        res.send({data: "Welcome to the rest service of Heroes powered by Nodejs/MongoDb."});
    });

    // List all the tasks (GET)
    app.get("/api/heroes", async (req, res) => {
        try {
    	    let data = await HeroModel.findAsync({}, {_id: 0, __v: 0}); 
            res.send(data);
        }
        catch(ex) {
            res.status(408).send({message: typeof ex === "object"? JSON.stringify(ex) : ex});
        }
    });

    // Get a task per id (GET)
    app.get("/api/heroes/:id", async (req, res) => {
	    try {
    	    let data = await HeroModel.findAsync({id: req.params.id}, {_id: 0, __v: 0}); 
            res.send({data});
        }
        catch(ex) {
            res.status(408).send({message: typeof ex === "object"? JSON.stringify(ex) : ex});
        }
    })

    // Insert a task (POST)
    app.post("/api/heroes", async (req, res) => {
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
    app.put("/api/heroes", async (req, res) => {
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
    app.delete("/api/heroes/:id", async (req, res) => {
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

//(async () => {
(async () => {
    try {
        const response = await Promise.promisify(goose.connect)(mongo_url, options); 
        //goose.connect(mongo_url, options, (error, response) => { 
        console.dir("connect to MongoDB");
        //});
        //console.log(response);

        // compile schema to model
        const HeroModel = Promise.promisifyAll(goose.model('Heroes', HeroSchema));
        //console.log("HeroModel", HeroModel);

        const app = express();

        // Parse JSON bodies (as sent by API clients)
        app.use(express.json());

        appRoute(app, HeroModel);
        
        //const listenAsync = require('util').promisify(app.listen);
        //let result = await listenAsync(port);
        app.listen(port, () => console.log(`dbServer app listening on port ${port}.`));
    }
    catch(ex) {
        console.error(ex);
    }
})();