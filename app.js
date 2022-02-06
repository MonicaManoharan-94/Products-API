const express = require('express')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

var app = express()
const swaggerOptions={
  swaggerDefinition:{
  info:{
    title:"Products api",
    version:"1.0.0"
  },
  servers:[
    {
      url:"http://127.0.0.1:8000"
    }
  ]
}, 
apis:['./routes/*.js']
}
const swaggerDocs=swaggerJSDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
dotenv.config({path: './config.env'})

app.use(express.json())

const authRouter = require('./routes/authRoutes')
const dataserviceRouter = require('./routes/dataserviceRoutes')

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', null)
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  )
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)

  next()
})

app.use('/auth', authRouter)
app.use('/api', dataserviceRouter)
// app.use('/api', dataserviceRoutes)

app.listen(8000, '127.0.0.1', function () {
  console.log('Server started. Listening to requests on port 8000')
})
console.log(`${__dirname}`)
