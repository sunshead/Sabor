module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index', {
      title: 'Homepage'
    });
  });
  
  app.get('/reg', function(req, res) {
    res.render('reg', {
      title: 'Register',
    });
  });
};