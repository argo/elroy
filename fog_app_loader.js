var AppResource = require('./app_resource');
var Scientist = require('./scientist');

var FogAppLoader = module.exports = function(server) {
  this.server = server;
  this.machines = [];
  this.app = null;
  this.path = null;
  this.exposed = {};
};

FogAppLoader.prototype.load = function(app) {
  this.app = app;
  this.path = '/' + (this.app.name || '');
  var self = this;
  app.init(this);
  self.server.loadApp(AppResource.create(this));
};

// bind to events in fog_runtime
FogAppLoader.prototype.on = function() {
  this.server.on.apply(this.server,arguments);
};

FogAppLoader.prototype.get = function(id, cb) {
  var self = this;
  var device = this.server.get(id, function(err, device){
    if(err) {
      cb(err);
    } else {
      self.machines.push(device);
      cb(null, device);
    }
  });
};

FogAppLoader.prototype.configure = function(/* args */) {
  return Scientist.configure.apply(null,arguments);
};

FogAppLoader.prototype.expose = function(machine, path) {
  if (typeof machine === 'function') {
    machine = Scientist.configure(machine);
  }

  path = path || '/' + machine.name;

  this.exposed[this.path + path] = machine;
};
