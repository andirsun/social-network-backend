const express = require("express");
const app = express();
const neo4j = require('neo4j-driver');

var driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic('neo4j', 'web2020'));

app.post("/addNewFriendRelation",function(req,res){
    let session = driver.session();
    session.run('MERGE (james:Person {name : $nameParam}) RETURN james.name AS name', {
        nameParam: 'James'
    })
    .then(result => {
        result.records.forEach(record => {
        console.log(record.get('name'))
        })
    })
    .catch(error => {
        console.log(error)
    })
    .then(() => session.close())
    
});
app.get("/getFriends");
app.get("/getFriendsFromFriends");
app.delete("/deleteFriendRelation");

app.post("/injectInfo",function(req,res){
    let session = driver.session();
 
    session.run("match(x:Person{name:'Tomas'}) Match(y:Person{name:'Jose'}) create(x)-[:FRIEND]->(y) ")
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
// CREATE(jose:Person {name: 'Jose', id:4}) 
// ##### RELACIONES ################
// match(x:Person{name:'Juan'}) Match(y:Person{name:'Laura'}) create(x)-[:FRIEND]->(y)
// match(x:Person{name:'Juan'}) Match(y:Person{name:'Tomas'}) create(x)-[:FRIEND]->(y)
// match(x:Person{name:'Laura'}) Match(y:Person{name:'Valentina'}) create(x)-[:FRIEND]->(y)
// match(x:Person{name:'Laura'}) Match(y:Person{name:'Erica'}) create(x)-[:FRIEND]->(y)
// match(x:Person{name:'Tomas'}) Match(y:Person{name:'Jose'}) create(x)-[:FRIEND]->(y) 



module.exports = app;