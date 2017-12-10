const package = require('./package.json')
const winston = require('winston')
const WebSocket = require('ws')
const path = require('path')

const git = require('simple-git')(path.join(__dirname, '..'))

const {Event} = require('../Shared')

const wss = new WebSocket.Server({
  port: 6516
})

wss.on('connection', (ws) => {
  winston.info('New connection')
  let hello = new Event('HELLO', {
    server: `${package.name}/${package.version}`,
    version: package.version
  })
  ws.send(hello.compress())
  ws.on('message', (_event) => {
    let event
    try {
      event = new Event(_event)
    } catch(err) {
      return winston.error('Failed to parse WS event', _event)
    }
    if(!event) {
      return winston.error('Failed to parse WS event', _event)
    }

    switch(event.event) {
      case 'UPDATE':
        git.pull((err, f) => {
          console.log(err, f)
        })
        break
      default:
        winston.warn('Unknown event send by a client. Is your server out-of-date?')
        break
    }
  })
})

winston.info('Started websocket server on port 6516')