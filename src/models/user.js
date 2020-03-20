const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./task')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is Invalide')
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate(value) {
        if (value.includes('password')) {
          throw new Error('Password is invalid!')
        }
      }
    },
    age: { type: Number, default: 0 },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true
  }
)

userSchema.virtual('tasks', {
  ref: 'Tasks',
  localField: '_id',
  foreignField: 'woner'
})

userSchema.methods.toJSON = function() {
  const user = this

  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens

  return userObject
}

userSchema.methods.genaretAuthToken = async function() {
  const user = this

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({ token })

  await user.save()

  return token
}

userSchema.statics.findCredentials = async (email, password) => {
  const user = await Users.findOne({ email })

  if (!user) throw new Error('Unable to login!')

  const ismatch = await bcrypt.compare(password, user.password)

  if (!ismatch) throw new Error('Unable to login!')

  return user
}

//hashing the password
userSchema.pre('save', async function(next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

//removing the tasks
userSchema.pre('remove', async function(next) {
  const user = this
  await Tasks.deleteMany({ woner: user._id })
  next()
})

const Users = mongoose.model('Users', userSchema)

module.exports = Users
