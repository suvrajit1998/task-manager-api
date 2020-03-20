const express = require('express')
const router = express.Router()
const sharp = require('sharp')
const Users = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const { sendWelcomeEmail, cancelationEmail } = require('../emails/account')

router.post('/user', async (req, res) => {
  try {
    const user = new Users(req.body)

    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.genaretAuthToken()

    res.status(201).send({ user, token })
  } catch (ex) {
    res.status(400).send(ex)
  }
})

router.post('/user/login', async (req, res) => {
  try {
    const user = await Users.findCredentials(req.body.email, req.body.password)
    const token = await user.genaretAuthToken()

    res.send({ user, token })
  } catch (ex) {
    res.status(400).send()
  }
})

router.post('/user/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

    await req.user.save()

    res.send()
  } catch (ex) {
    res.status(500).send()
  }
})

router.post('/user/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save()

    res.send()
  } catch (ex) {
    res.status(500).send()
  }
})

router.get('/user/me', auth, async (req, res) => {
  res.send(req.user)
})

router.patch('/user/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowdUpdate = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every(update =>
    allowdUpdate.includes(update)
  )

  if (!isValidOperation)
    return res.status(400).send({ error: 'Invalid updates' })

  try {
    const user = req.user

    updates.forEach(update => {
      user[update] = req.body[update]
    })

    await user.save()

    res.send(user)
  } catch (ex) {
    res.status(400).send(ex)
  }
})

router.delete('/user/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    cancelationEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (ex) {
    res.status(500).send(ex)
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload images'))
    }
    cb(undefined, true)
  }
})

router.post(
  '/user/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message })
  }
)

router.delete('/user/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/user/:id/avatar', async (req, res) => {
  try {
    const user = await Users.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/jpg')
    res.send(user.avatar)
  } catch (ex) {
    res.status(404).send()
  }
})

module.exports = router
