'use strict'

var settingsManager = require('../models/settings')


module.exports = function(io) {
  settingsManager.on('user added', function(user) {
    io.emit('user added', user)
  })

  settingsManager.on('user deleted', function(name) {
    io.emit('user deleted', name)
  })

  settingsManager.on('user renamed', function(data) {
    io.emit('user renamed', data)
  })

  io.on('connection', function(err, socket) {
    if (err) return console.error(err)

    socket.isAdmin = true

    socket.emit('settings', settingsManager.serialize())

    socket.on('update', function(key, value) {
      settingsManager.updateSettings(key, value)
    })

    socket.on('add domain', function(domain) {
      settingsManager.addDomain(domain)
    })

    socket.on('remove domain', function(idx) {
      settingsManager.removeDomain(idx)
    })

    socket.on('add allowed', function(allowed) {
      settingsManager.addAllowed(allowed)
    })

    socket.on('remove allowed', function(idx) {
      settingsManager.removeAllowed(idx)
    })

    socket.on('add ip', function(ip) {
      settingsManager.addIP(ip)
    })

    socket.on('remove ip', function(idx) {
      settingsManager.removeIP(idx)
    })

    socket.on('add rude', function(rude) {
      settingsManager.addRude(rude)
    })

    socket.on('remove rude', function(idx) {
      settingsManager.removeRude(idx)
    })

    socket.on('ban', function(name) {
      settingsManager.users.ban(name)
    })

    socket.on('reset chat', function() {
      settingsManager.resetChat()
    })
  })
}