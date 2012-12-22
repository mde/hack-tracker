var passport = require('passport')
  , user = require('./user')
  , successRedirect = geddy.config.passport.successRedirect
  , failureRedirect = geddy.config.passport.failureRedirect
  , cryptPass;

var SUPPORTED_SERVICES = [
      'yammer-staging'
    , 'yammer-production'
    ];

SUPPORTED_SERVICES.forEach(function (item) {
  var config = {
        callbackURL: geddy.config.fullHostname + '/auth/' +
            item + '/callback'
      }
    , Strategy = require('passport-' + item).Strategy;

  geddy.mixin(config, geddy.config.passport[item]);
  passport.use(new Strategy(config,
      function(token, tokenSecret, profile, done) {
    done(null, profile);
  }));
});

var actions = new (function () {
  var self = this;

  var _createInit = function (authType) {
        return function (req, resp, params) {
          var self = this;
          req.session = this.session.data;
          // FIXME: hack until Passport defers to resp.redirect
          resp.end = function () {};
          resp.setHeader = function (headerName, val) {
            resp.redirect(val);
          };
          passport.authenticate(authType)(req, resp);
        };
      }

    , _createCallback = function (authType) {
        return function (req, resp, params) {
          var self = this;
          req.session = this.session.data;
          // FIXME: hack until Passport defers to resp.redirect
          resp.end = function () {};
          resp.setHeader = function (headerName, val) {
            resp.redirect(val);
          };
          passport.authenticate(authType, function (err, profile) {
            if (!profile) {
              self.redirect(failureRedirect);
            }
            else {
              try {
                user.lookupByPassport(authType, profile, function (err, user) {
                  if (err) {
                    self.error(err);
                  }
                  else {
                    self.session.set('userId', user.id);
                    self.session.set('authType', authType);
                    self.redirect(successRedirect);
                  }
                });
              }
              catch (e) {
                self.error(e);
              }
            }
          })(req, resp, function (e) {
            if (e) {
              self.error(e);
            }
          });
        };
      };

  SUPPORTED_SERVICES.forEach(function (i) {
    var item = geddy.string.camelize(i);
    self[item] = _createInit(i);
    self[item + 'Callback'] = _createCallback(i);
  });

})();

module.exports = actions;
