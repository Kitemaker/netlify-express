var express = require('express');
var router = express.Router();
let neo4j = require('./adapter/neo4j');

const CMD_LIST_NODES = {"statements":[
  {
    "statement":"MATCH (n) RETURN distinct labels(n), count(*)",
    "parameters":{
      "props":{}}
    }
  ]
}

/* GET List of all nodes. */
router.get('/node',  function(req, res,next) {

  console.log('message from /nodes//match-name req.query = ', req.query);
  let subCmd = null;
  if (req.query.label && req.query.name) {
    subCmd = "MATCH (n: " + req.query.label + " ) WHERE n.name = \"" + req.query.name + "\"  RETURN n"
  }
  else if (req.query.name) {
    subCmd = "MATCH (n) WHERE n.name = \"" + req.query.name + "\"  RETURN n"
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
    let response =  neo4j.commmitCommand(cmd);
    res.status(200).send(response);
  }
  else {
    res.status(400).send({ message: "Node label or name is required to search" });
  }
  next();
});

/* GET List of all nodes. */
router.get('/nodes',  function(req, res,next) {
console.log('message from /nodes '); 

  let _nodelist = [] ;
  let response =  neo4j.commmitCommand(CMD_LIST_NODES);
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
router.get('/nodes/:label', async function(req, res) {
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
router.get('/', function(req, res) {
  console.log('message from base ');
  res.status(200).send({ message: 'Welcome To Correctly' });
});

module.exports = router;

