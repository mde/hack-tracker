var passport = require('../helpers/passport')
  , requireAuth = passport.requireAuth;

var Application = function () {
  this.before(requireAuth);
};

exports.Application = Application;



