'use strict'

/**
 * Init Express routing
 *
 * @param {express} app
 */
module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index')
  })

  app.get('/private', function(req, res) {
    res.render('index-private')
  })

  // render settings page
  app.get('/admin', function(req, res) {
    res.render('settings')
  })

  app.get('/chat.dev', function(req, res) {
    res.render('dev')
  })

  app.get('/chat.dev.private', function(req, res) {
    res.render('dev-private')
  })
}