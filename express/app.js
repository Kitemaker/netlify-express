var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let neo4j = require('./routes/adapter/neo4j');


var nodesRouter = require('./routes/nodes');
var usersRouter = require('./routes/users');
var nodeSingleRouter = require('./routes/nodeSingle');
const { runInContext } = require('vm');
var app = express();
const CMD_LIST_NODES = {"statements":[
  {
    "statement":"MATCH (n) RETURN distinct labels(n), count(*)",
    "parameters":{
      "props":{}}
    }
  ]
}
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log('Message from app.js');
// app.use('/node', nodesRouter);
// app.use('/users', usersRouter);
// app.use('/nodes/:label', nodesRouter);
// app.use('/nodes', nodesRouter);
app.get('/node',  async function(req, res,next) {

  console.log('message from /nodes//match-name req.query = ', req.query);

  let subCmd = null;
  if (req.query.label && req.query.name) {
    subCmd = "MATCH (n: " + req.query.label + " ) WHERE n.name = \"" + req.query.name + "\"  RETURN n"
  }
  else if (req.query.name && !req.query.label) {
    subCmd = "MATCH (n) WHERE n.name = \"" + req.query.name + "\"  RETURN n"
  }
  else if (req.query.label){
    subCmd = "MATCH (n: " + req.query.label + ") RETURN n "
  }
  else {
    subCmd = null;
  }
  if (subCmd) {
    let cmd = {
      "statements": [
        {
          "statement": subCmd, "parameters": { "props": {} }
        }
      ]
    }
    let response =  await neo4j.commmitCommand(cmd);
    res.status(200).send(response);
  }
  else {
    res.status(400).send({ message: "Node label or name is required to search" });
  }

});

// GET get a property value  query param nodeName OR nodeID  and propertyName 
app.get('/node/:label/property',  async function(req, res) {

  console.log('message from /nodes/:label/name/property req.query = ', req.query);  
  let subCmd = null;
  if (req.query.nodeName || req.query.nodeID){
      if (req.query.nodeID && req.query.propertyName) {     
        subCmd = "MATCH (n: " + req.params.label + " ) WHERE id(n) = " + req.query.nodeID + "  RETURN n." + req.query.propertyName  ;
        let cmd = {
          "statements": [ {"statement": subCmd, "parameters": { "props": {} } }]
        }    
        let response =  await neo4j.commmitCommand(cmd);
        res.status(200).send(response);      
      }
    else if(req.query.nodeName && req.query.propertyName){ 

      subCmd = "MATCH (n: " + req.params.label + " ) WHERE n.name = \"" + req.query.nodeName + "\"  RETURN n." + req.query.propertyName  ;
      console.log('command text = ', subCmd);
      let cmd = {
        "statements": [{"statement": subCmd, "parameters": { "props": {} } }]
      }
      
      let response =  await neo4j.commmitCommand(cmd);
      res.status(200).send(response);

    }
    else {
        res.status(400).send({ message: "propertyName is missing in query string" , params: req.query});
      }
  }
  else{
      res.status(400).send({ message: "nodeName or nodeID must be provided to search" , params: req.query});
    }

});


// GET get a property value  query param nodeName OR nodeID  and propertyName 
app.post('/node/:label/property',  async function(req, res) {

  console.log('message from /nodes/:label/name/property req.query = ', req.query);  
  let subCmd = null;
  if (req.query.nodeName || req.query.nodeID){
      if (req.query.nodeID && req.query.propertyName) {     
        subCmd = "MATCH (n: " + req.params.label + " ) WHERE id(n) = " + req.query.nodeID + "  RETURN n." + req.query.propertyName  ;
        let cmd = {
          "statements": [ {"statement": subCmd, "parameters": { "props": {} } }]
        }    
        let response =  await neo4j.commmitCommand(cmd);
        res.status(200).send(response);      
      }
    else if(req.query.nodeName && req.query.propertyName){ 

      subCmd = "MATCH (n: " + req.params.label + " ) WHERE n.name = \"" + req.query.nodeName + "\"  RETURN n." + req.query.propertyName  ;
      console.log('command text = ', subCmd);
      let cmd = {
        "statements": [{"statement": subCmd, "parameters": { "props": {} } }]
      }
      
      let response =  await neo4j.commmitCommand(cmd);
      res.status(200).send(response);

    }
    else {
        res.status(400).send({ message: "propertyName is missing in query string" , params: req.query});
      }
  }
  else{
      res.status(400).send({ message: "nodeName or nodeID must be provided to search" , params: req.query});
    }

});


/* GET List of all nodes. */
app.get('/nodes',  async function(req, res,next) {
console.log('message from /nodes '); 

  let _nodelist = [] ;
  let response =  await neo4j.commmitCommand(CMD_LIST_NODES);
  let nodeData = response.results[0].data;
  if(nodeData){
   for(var i = 0;i <nodeData.length;i++){
     //If multiple labels are specified     
       _nodelist.push(nodeData[i].row);
  }}
  res.status(200).send({results: _nodelist});
}
);

/* GET Node List of type Label :label. */
app.get('/nodes/:label', async function(req, res) {
  console.log('message from /nodes/:label');
  if(req.params.label && req.params.label !== ""){
  let subCmd = "MATCH (n: " + req.params.label + ") RETURN n"
  let cmd =  {"statements":[
    {
      "statement":subCmd,
      "parameters":{
        "props":{}}
      }
    ]
  }
    let response = await neo4j.commmitCommand(cmd);  
    res.status(200).send(response);
  }
  else{
    res.status(400).send({message: "Node label is not defined or empty"});
  }
});

/* GET home page. */
app.get('/', function(req, res) {
  console.log('message from base ');
  res.status(200).send({ message: 'Welcome To Correctly' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
console.log(err.message);
  // render the error page
  res.status(err.status || 500).send( err.message);
});

module.exports = app;
