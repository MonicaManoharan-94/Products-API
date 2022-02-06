const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const pool = require('../utils/database').pool
const bcrypt = require('bcrypt')

const userToken = user => {
  return jwt.sign({ username: user }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

async function hashPassword (password) {
  const passwordnew = password
  const saltRounds = 10

  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(passwordnew, saltRounds, function (err, hash) {
      if (err) reject(err)

      resolve(hash)
    })
  })

  return hashedPassword
}

exports.register = catchAsync(async (req, res, next) => {
  const { username, password } = req.body

  if (!username || !password) return next(new AppError('Invalid data', 400))

  const userData = await pool.query('SELECT * FROM usersdb WHERE username=$1', [
    username
  ])

  if (userData.length > 0) res.status(201).send('User already exists!')

  const hashed = await hashPassword(password)
  const insert = await pool.query(
    'INSERT INTO usersdb (username, password) VALUES ($1,$2)',
    [username, hashed]
  )

  if (insert) res.status(200).send('User has been registered successfully')

  res.status(500).send('Internal server error')
})

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body

  if (!username || !password) return next(new AppError('Invalid data', 400))

  const userData = await pool.query('SELECT * FROM usersdb WHERE username=$1', [
    username
  ])

  if (
    !userData ||
    !(await bcrypt.compare(password, userData.rows[0].password))
  ) {
    return next(new AppError('Incorrect username or password', 401))
  }

  const token = userToken(username)
  res.status(200).json({
    status: 'success',
    access_token: token
  })
})

const verifyToken = token => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return null
  }
}

exports.protect = catchAsync(async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    var bool=req.headers.authorization.startsWith("Bearer")
    if (!token || !verifyToken(token) || !bool) res.status(404).send('User is not logged in')
    delete req.body.token

    next()
})