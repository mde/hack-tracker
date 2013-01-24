var Hacks = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

  this.index = function (req, resp, params) {
    var self = this;

    geddy.model.Hack.all(function(err, hacks) {
      self.respond({params: params, hacks: hacks});
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    var self = this
      , hack = geddy.model.Hack.create(params);

    if (!hack.isValid()) {
      params.errors = hack.errors;
      self.transfer('add');
    }

    hack.save(function(err, data) {
      if (err) {
        params.errors = err;
        self.transfer('add');
      } else {
        self.redirect({controller: self.name});
      }
    });
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.Hack.first(params.id, function(err, hack) {
      if (!hack) {
        var err = new Error();
        err.statusCode = 400;
        self.error(err);
      } else {
        self.respond({params: params, hack: hack.toObj()});
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.Hack.first(params.id, function(err, hack) {
      if (!hack) {
        var err = new Error();
        err.statusCode = 400;
        self.error(err);
      } else {
        self.respond({params: params, hack: hack});
      }
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.Hack.first(params.id, function(err, hack) {
      hack.updateAttributes(params);
      if (!hack.isValid()) {
        params.errors = hack.errors;
        self.transfer('edit');
      }

      hack.save(function(err, data) {
        if (err) {
          params.errors = err;
          self.transfer('edit');
        } else {
          self.redirect({controller: self.name});
        }
      });
    });
  };

  this.destroy = function (req, resp, params) {
    var self = this;

    geddy.model.Hack.remove(params.id, function(err) {
      if (err) {
        params.errors = err;
        self.transfer('edit');
      } else {
        self.redirect({controller: self.name});
      }
    });
  };

};

exports.Hacks = Hacks;
