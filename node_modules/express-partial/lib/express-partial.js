var async = require('async');

module.exports = function () {
  return function expressPartial (req, res, next) {
    // Attach our helper function
    res.renderPartials = function renderPartials (partials, callback) {
      var renderedPartials = {};

      // Default the callback to immediately respond with the renderedPartials
      // object or, if there was an error, pass it on down the middleware chain
      callback = callback || function renderPartialsCb (err, partialsData) {
        if (err) {
          return next(err);
        }
        res.send(partialsData);
      };

      // Loop over the template names
      var names = Object.getOwnPropertyNames(partials);
      async.each(names, function renderPartial (name, cb) {
        // Call render as normal but pass a function to get the compiled html string
        res.render(name, partials[name], function handleRenderedPartial (err, html) {
          // If there was an error, call back with it
          if (err) {
            return cb(err);
          }

          // Otherwise, add the rendered html to the renderedPartials object
          renderedPartials[name] = html;
          cb();
        });
      }, function handleRenderedPartials (err) {
        // If we got an error, bubble it up to the main callback
        if (err) {
          return callback(err);
        }

        // Otherwise, return the renderedHtml object to the callback
        callback(null, renderedPartials);
      });
    };
    next();
  };
};
