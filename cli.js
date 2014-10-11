#!/usr/bin/env node

var program = require('commander');
var pkg = require('./package.json');
var request = require('request');
var fs = require('fs');
var path = require('path');
var child = require('child_process');
var fork = child.fork;
var zettaFile = path.join(process.env.HOME, '.zetta');
var rels = require('zetta-rels');
var repl = require('repl');
var util = require('util');
var Transform = require('stream').Transform;
var replCb;

//Return proper url in this order. Flag, user set default, default
function getUrl(program) {
  var fileExists = fs.existsSync(zettaFile);
  if(program.url) {
    return program.url;
  } else if(fileExists) {
    var buf = fs.readFileSync(zettaFile);
    var obj = JSON.parse(buf.toString());
    return obj.url;
  } else {
    return 'http://127.0.0.1:1337/';
  }
}



program
  .version(pkg.version)
  .option('-u, --url <url>', 'Base url for zetta. Defaults to http://127.0.0.1:1337/');

program
  .command('devices')
  .option('<server>', 'Server name to retrieve devices from.')
  .description('Get devices for given zetta instance.')
  .action(function(server) {
    var url = getUrl(program);
    console.log('Using endpoint: ' + url);
    request(url, function(err, res, body) {
      if(err) {
        console.log('Error retrieving endpoint');
      } else {
        var json = JSON.parse(body);
        json.links.forEach(function(link) {
          if(link.rel.indexOf(rels.server) > -1) {
            request(link.href, function(err, res, body) {
              if(err) {
                console.log('Error retrieving devices.');
              } else {
                var json = JSON.parse(body);
                console.log('Devices:');
                json.entities.forEach(function(device) {
                  console.log(device.properties.id + '          ' + device.properties.name);
                });
              }
            });
          }
        });
      }
    });
  });

program
  .command('peers')
  .description('List all peers on the current zetta server')
  .action(function() {
    var url = getUrl(program);
    console.log('Using endpoint:' + url);
    request(url, function(err, res, body) {
      if(err) {
        console.log('Error retrieving endpoint.');
      } else {
        var json = JSON.parse(body);
        json.links.forEach(function(link) {
          if(link.rel.indexOf(rels.server) > -1) {
            console.log(link.title + '                ' + link.href + ' <-- You are here! ');
          } else if(link.rel.indexOf(rels.peer) > -1) {
            console.log(link.title + '                ' + link.href);
          }
        });
      }
    });
  });


program
  .command('default <url>')
  .description('Set a default url to use.')
  .action(function(url) {
    url = { url: url };
    var str = JSON.stringify(url);
    var fileHandle = fs.openSync(zettaFile, 'w');
    var buf = new Buffer(str);
    var res = fs.writeSync(fileHandle, buf, 0, buf.length, 0);
    console.log('New default set!');
  });

program
  .command('repl <script>')
  .description('Start a repl session inside Zetta.')
  .action(function(script) {
    var modulePath = path.join(process.cwd(), script);
    var childProc = fork(modulePath, [], {silent: true});
    process.on('exit', function() {
      childProc.kill(0);
    });
    childProc.on('message', function(msg){
      if(replCb) {
        replCb(null, msg.msg);
      }
      else {
        console.log(msg.msg);
      }
    });
    
    var appRepl = repl.start({
      prompt: 'ZETTA> ',
      eval: function(cmd, context, file, cb){
        var command = cmd.replace('(', '').replace(')','').replace('\n', '');
        var split = command.split(' ');
        if(split[1]) {
          childProc.send({ msg: split[0], params: split[1]});
        } else {
          childProc.send({ msg: command });
        }
        replCb = cb;
      }
    });


  });

program.parse(process.argv);
