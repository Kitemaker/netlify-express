const livoconfig = require('./config.json');
const fetch = require('node-fetch');
let myHeaders = {"Authorization": livoconfig.authorization, "Content-Type": "application/json"};

class Neo4jAdapter { 

    constructor(ip, userName, password) {
        this.ip = ip;
        this.userName = userName;
        this.password = password;
        this.command = '';    
      }
 
  getServiceRoot(){
       let api = livoconfig.ipaddress;
       fetch(api)
        .then(response => response.json())
        .then(data => console.log(data));
        return
      };

static async commmitCommand(command){

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(command),
    redirect: 'follow'
  };
  let questData = {}
  let response = await fetch(livoconfig.commitCommand, requestOptions); 
  let out = await response.json();
  console.log('response from neo4j = ', out);
  return out;
 
}
}

module.exports = Neo4jAdapter;

