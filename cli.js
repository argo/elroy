#!/usr/bin/env node

var program = require('commander');
var pkg = require('./package.json');
var request = require('request');
var fs = require('fs');
var path = require('path');
var zettaFile = path.join(process.env.HOME, '.zetta');
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
        console.log(JSON.stringify(json, null, 2));
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


program.parse(process.argv);
