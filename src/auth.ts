// import fs from 'fs'
import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import { Auth } from './entity/auth'
import { User } from './entity/user'

const auth = express.Router()

// TODO
// export const secret = fs.readFileSync('public.pem');
export const secret = 'secret'

auth.post('/token', async (req, res) => {
  res.contentType('application/json')
  try {
    if (!req.session) {
      res.send({ error: 'session error' })
      return
    }

    const { email, password } = req.body
    if (!email && !password) {
      res.send({ error: 'rquest errror' })
      return
    }
    const userinfo = await Auth.findOne({
      select: ['id', 'user'],
      where: { email, password }
    })
    if (!userinfo) {
      req.session.token = null
      res.send({ error: 'Unable to authenticate!' })
      return
    }
    const token = jwt.sign({ id: userinfo.id }, secret, { expiresIn: '25h' })
    console.log(token)
    req.session.token = token
    res.send({ token })
  } catch (err) {
    res.send({ error: 'network error' })
  }
})

auth.get('/logout', (req, res) => {
  res.contentType('application/json')
  if (!req.session) {
    res.send({ error: 'server error' })
    return
  }
  if (req.session.token) {
    req.session.token = null
    res.send({ message: 'signout success.' })
  } else {
    res.send({ message: 'not logged in' })
  }
})

auth.post('/register', async (req, res, next) => {
  res.contentType('application/json')
  try {
    const { email, password } = req.body
    const data = new Auth()
    data.email = email
    data.password = password
    await Auth.save(data)
    const userinfo = new User()
    await User.save(userinfo)
    data.user = userinfo
    await Auth.save(data)
    res.send(data)
  } catch (err) {
    res.send({ err })
  }
})

export const authRequired: express.RequestHandler = (req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8')
  if (!req.session) {
    res.json({
      message: 'server error.'
    })
    return
  }
  if (!req.session.token) {
    res.json({
      message: 'required authentication.'
    })
    return
  }
  next()
}

export default auth
