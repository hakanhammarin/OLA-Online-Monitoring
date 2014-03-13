//app.js
var fs = require('fs');
var warnings = 'no warnings' ;
var listsize = 1;
var clientConnections=0;

var http = require('http').createServer(function handler(req, res) {
    fs.readFile(__dirname + '/index.html', function(err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
}).listen(3000);
var currentPassings='';
var currentFinish='';
var currentControls='';

var passes = 'SELECT controls.id as control,count(*) as passings FROM splittimes INNER JOIN splittimecontrols ON splittimecontrols.splitTimeControlId=splittimes.splitTimeControlId INNER JOIN controls ON controls.controlId=splittimecontrols.timingControl INNER JOIN results ON splittimes.resultRaceIndividualNumber = results.resultId INNER JOIN entries ON entries.entryID = results.EntryId  WHERE (controls.typeCode = "WTC" OR controls.typeCode = "FC") AND  time_to_sec(TIME(splittimes.modifyDate))  >= 82555 GROUP BY controls.id;';
var online_control = 'SELECT controls.id as control FROM controls WHERE (controls.typeCode = "WTC" OR controls.typeCode = "FC")';

var passes_120 = 'SELECT count(*) as passings FROM splittimes INNER JOIN splittimecontrols ON splittimecontrols.splitTimeControlId=splittimes.splitTimeControlId INNER JOIN controls ON controls.controlId=splittimecontrols.timingControl INNER JOIN results ON splittimes.resultRaceIndividualNumber = results.resultId INNER JOIN entries ON entries.entryID = results.EntryId  WHERE controls.id = "41" AND  time_to_sec(TIME(splittimes.modifyDate))  >= 82555-120 order by splittimes.modifyDate desc;';

var querystringfinish = 'SELECT results.bibNumber as BibNumber, results.relayPersonOrder AS Leg, SUBSTR(passedTime,12,8) as Time ,controls.id as Control FROM splittimes INNER JOIN splittimecontrols ON splittimecontrols.splitTimeControlId=splittimes.splitTimeControlId INNER JOIN controls ON controls.controlId=splittimecontrols.timingControl INNER JOIN results ON splittimes.resultRaceIndividualNumber = results.resultId INNER JOIN entries ON entries.entryID = results.EntryId WHERE controls.id = "100"  OR controls.id = "200" ORDER BY splittimes.passedTime DESC LIMIT 0,100;';

function checkTime(i)
{
if (i<10)
  {
  i="0" + i;
  }
return i;
}

var mysql = require('mysql');
var MYSQL_USERNAME = 'root';
var MYSQL_PASSWORD = 'root';
 
var client = mysql.createConnection({
  host: 'localhost',
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
});
client.query('USE test10mila2014');
client.query(online_control, function(err, results, fields) {
	 currentControls=results;
	 console.log(currentControls);
	});
var io = require('socket.io').listen(http);
io.set('log level', 1);
io.sockets.on('connection', function(socket) {
  console.log('Client connected');
  socket.join('subscribe');
  io.sockets.emit('controls', currentControls); 
  io.sockets.emit('passings', currentPassings); 
  //io.sockets.emit('finish', currentFinish); 
  clientConnections += 1;
  console.log('Initiated Connections: '+clientConnections);
  
 });
 
setInterval(function() { 
	var today=new Date();
	var h=today.getHours();
	var m=today.getMinutes();
	var s=today.getSeconds();
	m=checkTime(m);
	s=checkTime(s);
	h=checkTime(h);
  
	console.log(h+':'+m+':'+s+' SQL Query: '+io.sockets.clients().length+' Connections'); 

client.query(passes, function(err, results, fields) {
	io.sockets.emit('passings', results); 
	currentPassings=results;
	 console.log(results);
	});
//client.query(querystringfinish, function(err, results, fields) {
//	io.sockets.emit('finish', results); 
//	currentFinish=results;
 // });
  
  var today=new Date();
  var h=today.getHours();
  var m=today.getMinutes();
  var s=today.getSeconds();
  m=checkTime(m);
  s=checkTime(s);
  h=checkTime(h);
  
  io.sockets.emit('time', h+':'+m+':'+s); 
//alter the teams list although the database is from the 2013 event 
 listsize += 1
  
  
  }, 10000);
  
 // splittimes.get_splittimes(function(times) {
   // console.log(times);
  // });
  
  // populate employees on client
  
    
 