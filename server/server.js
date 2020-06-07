require("./config/config");
const neo4j = require('neo4j-driver');

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const http = require("http");
let server = http.createServer(app);
// Public path to access data
const publicPath = path.resolve(__dirname, "../public");

////////////////////////////////////
app.use(express.static(publicPath)); //access to data like images or anything else
// Using module express-fileupload to upload files to server
app.use(fileUpload({ useTempFiles: true })); 
// print in the server console the petitions like logs
app.use(morgan("dev"));
// Brings security in the api rest petitions
app.use(cors({origin:true,credentials:true}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//all routes to API
app.use(require("./routes/index")); // import all routes

/* Mongo Database conection */
mongoose.connect(
	"mongodb+srv://web2020:web2020@timugo-d2l1g.mongodb.net/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=true",
	{ useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true ,useFindAndModify: false},
	(err, res) => {
		if (err) throw err;

		console.log("Base de datos ONLINE");
	}
);

/* Error handling */
process.on("unhandledRejection", (reason, promise) => {
	console.log("Unhandled Rejection at:", reason.stack || reason);
	// Recommended: send the information to sentry.io
	// or whatever crash reporting service you use
});
/* Server definition*/
server.listen(process.env.PORT, () => {
	console.log("Escuchando puerto: ", process.env.PORT);
});