import * as http from 'http'
import { join } from 'path'
import * as express from 'express'
import * as session from 'express-session'

import * as bodyParser from 'body-parser'
import * as socket from 'socket.io'
import { envload } from './setup'
import api from './api'
import apolloServer from './apollo'
import auth, { secret } from './auth'
import { connectDatabase } from './db/typeorm'

envload()
connectDatabase()
// express
const app = express()
// heroku -> process.env.PORT
const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// express-session
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // https
      maxAge: 1000 * 60 * 60
    }
  })
)
// static path
const root = join(__dirname, 'public')
// routing
app.use('/api', api)
app.use('/auth', auth)
app.use('/chat', express.static(join(root, 'chat')))
// app.use('/graphql', graphql)

// apollo server
apolloServer.applyMiddleware({ app, path: '/graphql' })
// console.log(apolloServer.graphqlPath) confirmation graphqlPath

// fallback -> root
app.use(
  '*',
  express.static(root, {
    dotfiles: 'ignore',
    // etag: false,
    extensions: ['htm', 'html']
    // maxAge: '1d',
    // redirect: false,
    // setHeaders: function(res, path, stat) {
    //   res.set('x-timestamp', String(Date.now()))
    // }
  })
)

// setup server
const server = http.createServer(app)
server.listen(port)

// WebSocket
const io = socket(server)
const chat = io.of('/chat')
chat.on('connection', socket => {
  socket.on('message', data => {
    const room = data.room
    socket.join(room)
    chat.to(room).emit('message', {
      ...data,
      createdAt: new Date().toDateString()
    })
  })
  socket.on('access', data => {
    const room = data.room
    socket.join(room)
    chat.to(room).emit('access', {
      ...data,
      createdAt: new Date().toDateString()
    })
  })
})
