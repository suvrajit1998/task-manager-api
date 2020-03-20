const express = require('express')
const router = express.Router()
const Tasks = require('../models/task')
const auth = require('../middleware/auth')

router.post('/task', auth, async (req, res) => {
  try {
    //const task = new Tasks(req.body)
    const task = new Tasks({
      ...req.body,
      woner: req.user._id
    })

    await task.save()
    res.send(task)
  } catch (ex) {
    res.status(400).send(ex)
  }
})

//GET /task?completed=true
//GET /task?limit=10&skip=20
//GET /task?sortBy:desc/asc
router.get('/task', auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate()

    res.send(req.user.tasks)
  } catch (ex) {
    res.status(500).send(ex)
  }
})

router.get('/task/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id

    const task = await Tasks.findOne({ _id, woner: req.user._id })

    if (!task) return res.status(404).send()

    res.send(task)
  } catch (ex) {
    res.status(500).send(ex)
  }
})

router.patch('/task/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowdUpdate = ['description', 'completed']
  const isValidOporation = updates.every(update =>
    allowdUpdate.includes(update)
  )

  if (!isValidOporation)
    return res.status(400).send({ error: 'Invalid inputs' })

  try {
    const task = await Tasks.findOne({
      _id: req.params.id,
      woner: req.user._id
    })

    if (!task) return res.status(404).send()

    updates.forEach(update => {
      task[update] = req.body[update]
    })

    await task.save()

    res.send(task)
  } catch (ex) {
    res.status(400).send(ex)
  }
})

router.delete('/task/:id', auth, async (req, res) => {
  try {
    const task = await Tasks.findOneAndDelete({
      _id: req.params.id,
      woner: req.user._id
    })

    if (!task) return res.status(404).send()

    res.send(task)
  } catch (ex) {
    res.status(500).send(ex)
  }
})

module.exports = router
