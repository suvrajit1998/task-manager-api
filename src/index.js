const express = require('express')
require('./db/mongoose')

const userRouter = require('./router/user')
const taskRouter = require('./router/task')

const app = express()

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

const port = process.env.PORT

app.listen(port, () => {
  console.log(`server is running on port: ${port}`)
})

// const Tasks = require('./models/task')
// const Users = require('./models/user')

// const main = async () => {
//   // const task = await Tasks.findById('5e708806defb87226844ea95')
//   // await task.populate('woner').execPopulate()
//   // console.log(task.woner)

//   const user = await Users.findById('5e709d90e542d72488c71683')
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks)
// }

// main()
