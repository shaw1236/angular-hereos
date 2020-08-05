// Node/MongoDb Service for Hero 
//
// Purpose: provide restful web api 
//
// Author : Simon Li  July 2020
//
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.HeroModel = void 0;
var express = require("express");
////////////////////////////////////////////////////////////////////////////
// appRoute.ts
var goose = require("mongoose");
var bluebird_1 = require("bluebird");
var mongo_host = process.env.MONGO_HOST || 'localhost';
var database = process.env.DATABASE || "mydatabase";
var mongo_url = "mongodb://" + mongo_host + ":27017/" + database;
var options = { useNewUrlParser: true, useUnifiedTopology: true };
var HeroSchema = new goose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true }
});
var response = goose.connect(mongo_url, options, function (err) {
    if (err)
        throw err;
    console.dir("connect to MongoDB");
    //console.log(response);
});
// compile schema to model
exports.HeroModel = bluebird_1.Promise.promisifyAll(goose.model('Heroes', HeroSchema));
function appRoute(app) {
    var _this = this;
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', 1);
        next();
    });
    // Dummy root request
    app.get("/", function (req, res) {
        console.log("root router");
        res.send({ data: "Welcome to the rest service of Heroes powered by ts-node/MongoDb." });
    });
    // List all the tasks (GET)
    app.get("/api/heroes", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var data, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.HeroModel.findAsync({}, { _id: 0, __v: 0 })];
                case 1:
                    data = _a.sent();
                    res.send(data);
                    return [3 /*break*/, 3];
                case 2:
                    ex_1 = _a.sent();
                    res.status(408).send({ message: typeof ex_1 === "object" ? JSON.stringify(ex_1) : ex_1 });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Get a task per id (GET)
    app.get("/api/heroes/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var data, ex_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.HeroModel.findAsync({ id: req.params.id }, { _id: 0, __v: 0 })];
                case 1:
                    data = _a.sent();
                    res.send({ data: data });
                    return [3 /*break*/, 3];
                case 2:
                    ex_2 = _a.sent();
                    res.status(408).send({ message: typeof ex_2 === "object" ? JSON.stringify(ex_2) : ex_2 });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Insert a task (POST)
    app.post("/api/heroes", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var data, _a, name_1, id, data, ex_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    if (!Array.isArray(req.body)) return [3 /*break*/, 2];
                    return [4 /*yield*/, exports.HeroModel.insertMany(req.body)];
                case 1:
                    data = _b.sent();
                    res.send({ data: data });
                    return [3 /*break*/, 6];
                case 2:
                    _a = req.body, name_1 = _a.name, id = _a.id;
                    if (!!id) return [3 /*break*/, 4];
                    return [4 /*yield*/, exports.HeroModel.countDocumentsAsync({})];
                case 3:
                    id = (_b.sent()) + 1;
                    _b.label = 4;
                case 4:
                    console.log({ id: id, name: name_1 });
                    return [4 /*yield*/, exports.HeroModel.createAsync({ id: id, name: name_1 })];
                case 5:
                    data = _b.sent();
                    res.send({ data: data });
                    _b.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    ex_3 = _b.sent();
                    res.status(408).send({ message: typeof ex_3 === "object" ? JSON.stringify(ex_3) : ex_3 });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); });
    // Update the task (PUT)
    app.put("/api/heroes", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var data, ex_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(req.body);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exports.HeroModel.updateOneAsync({ id: req.body.id }, { "$set": req.body })];
                case 2:
                    data = _a.sent();
                    res.send({ data: data });
                    return [3 /*break*/, 4];
                case 3:
                    ex_4 = _a.sent();
                    res.status(408).send({ message: typeof ex_4 === "object" ? JSON.stringify(ex_4) : ex_4 });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Delete a task (DELETE)
    app["delete"]("/api/heroes/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var data, ex_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("ID to be deleted: " + req.params.id); // req.body.id)
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exports.HeroModel.deleteOneAsync({ id: req.params.id })];
                case 2:
                    data = _a.sent();
                    res.send({ data: data });
                    return [3 /*break*/, 4];
                case 3:
                    ex_5 = _a.sent();
                    res.status(408).send({ message: typeof ex_5 === "object" ? JSON.stringify(ex_5) : ex_5 });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
}
exports["default"] = appRoute;
///////////////////////////////////////////////////////////////////////////////////////////
var port = +process.env.PORT || 8080;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var app;
    return __generator(this, function (_a) {
        try {
            app = express();
            // Parse JSON bodies (as sent by API clients)
            app.use(express.json());
            appRoute(app);
            app.listen(port, function () { return console.log("dbServer app listening on port " + port + "."); });
        }
        catch (ex) {
            console.error(ex);
        }
        return [2 /*return*/];
    });
}); })();
