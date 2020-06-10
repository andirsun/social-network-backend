const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const neo4j = require('neo4j-driver');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/posts');
const { tokenVerification } = require('../middlewares/auth');
var mysql = require('mysql');

///MYsql driver conection
var connection = mysql.createConnection({
	host : '167.172.216.181',
	port : 3306,
  user : 'andirsun',
  password : 'web2020',
  database : 'Users'
});
 
// connection.connect();
 
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
 
// connection.end();
//conection to databse nee4J
var driver = neo4j.driver(
	'neo4j://167.172.216.181:7687',
	neo4j.auth.basic('neo4j', 'neo4j')
);
//neo4j.auth.basic('neo4j', 'web2020'));
    
app.get("/getFriends",tokenVerification,function(req,res){
	//create the node js session driver in neo4j
	let session = driver.session();
	//reading the id from the url parameters
	let idPerson = req.query.idPerson;
	//run the query
	let arrayFriends=[];
	session.run("MATCH (x:Person {id:"+parseInt(idPerson)+"})-[:FRIEND]->(fof) RETURN fof.name as name , fof.id as id")
	.then(result => {
		result.records.forEach(record=>{
			var name = record.get("name");
			arrayFriends.push(name);
		});
		return res.status(200).json({
			response:2,
			content: arrayFriends
		});
	})
	.catch(error => {
		return res.status(200).json({
			response:1,
			content: error
		});
	})
	.then(() => session.close());
});
app.get("/getFriendsFromFriends",tokenVerification,function(req,res){
	//create the node js session driver in neo4j
	let session = driver.session();
	
	//reading the id from the quest url parameters
	let idPerson = req.query.idPerson;
	//create array to return
	let arrayFriends = [];
	//run the query
	session.run("MATCH (x:Person {id:"+parseInt(idPerson)+"})-[:FRIEND]-(nodo)-[:FRIEND]->(xFriends) RETURN xFriends")
	.then(result => {
		result.records.forEach(record=>{
				console.log(record["_fields"][0]["properties"]["name"])
				//Get the name of the each record 
				var name = record["_fields"][0]["properties"]["name"];
				arrayFriends.push(name)
		});
		//return the response of the query
		return res.status(200).json({
			response:2,
			content: arrayFriends
		});
	})
	.catch(error => {
		return res.status(200).json({
			response:1,
			content: error
		});
	})
	.then(() => session.close());
});
app.get("/publication/user",tokenVerification,(req,res)=>{
	/* get query params*/ 
	let idUser = req.query.userId;
	Post.find({idUser : idUser},(err,response)=>{
		/* handling error*/
		if(err) return res.status(500).json({response : 3,content:{err}});
		/* response */
		return res.status(200).json({
			response : 2,
			content :{
				posts : response
			}
		});
	})
});
app.get("/publication/user/friends=true",tokenVerification,(req,res)=>{
  /* get query params*/ 
  let idUser = req.query.userId;
  /* here its neccesary make a request to get the friends of this user*/
  let friendsIds = [1,2] //temporal
  /* Fix all posts from friends -> means all posts with idUser = friendsIds array */
  Post.find({idUser : {$in : friendsIds}},(err,posts)=>{
    /* handling error*/
    if(err) return res.status(500).json({response : 3,content:{err}});
    /* response */
    return res.status(200).json({
      response : 2,
      content :{
        posts
      }
    });
})
});
app.post("/users",(req,res)=>{
	let body = req.body;
	let name = body.name;
	let lastName = body.lastName;
	let phone = body.phone;
	let address = body.address;
	let userName = body.userName;
	let password = bcrypt.hashSync(body.password, 10);
	let email = body.email;
	connection.connect();
	let query =`INSERT INTO user (name,lastname,cellphone,address,username,password,email) VALUES (${name},${lastName},${phone},${address},${userName},"${password}",${email})`;
	/* Query Sql*/
	connection.query(query, (error, results, fields)=>{
		if (error) return res.status(500).json({response : 3,content:{error}});
		return res.status(200).json({
			response : 2,
			content :{
				message : "Usuario creado correctamente"
			}
		});
	});
	/* close conection */
	connection.end();
});
app.post("/publication/user",tokenVerification,(req,res)=>{
	/* get query params*/ 
	let idUser = req.query.userId;
	var body = req.body;
	let comment = body.text || "";
	let newPost = new Post({
		idUser,
		text : comment,
	})
	/* save new post*/
	newPost.save((err,response)=>{
		/* handling error*/
		if(err) return res.status(500).json({response : 3,content:{err}});
		/* response */
		return res.status(200).json({
			response : 2,
			content :{
				message : "Post creado correctamente"
			}
		});
	});
});
app.post("/login",tokenVerification,(req,res)=>{
	var body = req.body;
	/* token expiration in 30 days */
	let token = jwt.sign({
		email : body.email
	},process.env.TOKEN_SEED,{expiresIn: 60*60*24*30});
	return res.status(200).json({
		ok : true,
		token : token
	});
});
app.post("/testToken",tokenVerification,(req,res)=>{
	/* */
	return res.status(200).json({
		ok : true,
		email : req.userEmail //come from middleware
	});
});
app.post("/addNewFriendRelation",tokenVerification,function(req,res){
	//create the node js session driver in neo4j
	let session = driver.session();
	//read the body if request
	let body = req.body;
	//reading the id from the body parameters
	let idPerson1 = body.idPerson1;
	let idPerson2 = body.idPerson2;
	//run the query
	session.run("MATCH (x:Person), (b:Person) WHERE x.id="+parseInt(idPerson1)+" AND b.id ="+parseInt(idPerson2)+" MERGE (x)-[r:FRIEND]->(b) RETURN x, b")
	.then(result => {
			return res.status(200).json({
					response:2,
					content: result
			});
	})
	.catch(error => {
			return res.status(200).json({
					response:1,
					content: error
			});
	})
	.then(() => session.close());
		
});
app.post("/runQuery",tokenVerification,function(req,res){
	let body = req.body;
	let query = body.query;
	let session = driver.session();

	session.run(query)
	.then(result => {
			result.records.forEach(record => {
			console.log(record)
			});
			return res.status(200).json({
					response:2,
					content: result
			});
	})
	.catch(error => {
			console.log(error)
			return res.status(200).json({
					response:1,
					content: error
			});
	})
	.then(() => session.close())
	
});
app.delete("/deleteFriendRelation",tokenVerification,function(req,res){
	//create the node js session driver in neo4j
	let session = driver.session();
	//read the body if request
	let body = req.body;
	//reading the id from the body parameters
	let idPerson1 = body.idPerson1;
	let idPerson2 = body.idPerson2;
	//run the query
	session.run("MATCH (n { id:"+parseInt(idPerson1)+" })-[r:FRIEND]->(m{id:"+parseInt(idPerson2)+"}) DELETE r ")
	.then(result => {
			return res.status(200).json({
					response:2,
					content: result
			});
	})
	.catch(error => {
			return res.status(200).json({
					response:1,
					content: error
			});
	})
	.then(() => session.close());
	
});
app.delete("/dropTables",function(req,res){
	let session = driver.session();

	session.run("MATCH(n) DETACH DELETE n ")
	.then(result => {
			result.records.forEach(record => {
			console.log(record)
			})
	})
	.catch(error => {
			console.log(error)
	})
	.then(() => session.close())
});

// CREATE(juan:Person {name: 'Juan', id:0}) 
// CREATE(erica:Person {name: 'Erica', id:1}) 
// CREATE(tomas:Person {name: 'Tomas', id:2}) 
// CREATE(laura:Person {name: 'Laura', id:3}) 
// CREATE(valentina:Person {name: 'Valentina', id:4}) 
// CREATE(jose:Person {name: 'Jose', id:5}) 
// ##### RELACIONES ################
// match(x:Person{name:'Juan'}) Match(y:Person{name:'Laura'}) create(x)-[:FRIEND]->(y)
// match(x:Person{name:'Juan'}) Match(y:Person{name:'Tomas'}) create(x)-[:FRIEND]->(y)
// match(x:Person{name:'Laura'}) Match(y:Person{name:'Valentina'}) create(x)-[:FRIEND]->(y)
// match(x:Person{name:'Laura'}) Match(y:Person{name:'Erica'}) create(x)-[:FRIEND]->(y)
// match(x:Person{name:'Tomas'}) Match(y:Person{name:'Jose'}) create(x)-[:FRIEND]->(y) 



module.exports = app;