const { config, staticFiles } = require('../config/environment')
const express = require('express')

const { logger, loggererr } = require('../log/logger')


const cluster = require('cluster')
const numCPUs = require('os').cpus().length


const baseProcces = () => {

  cluster.on('exit', (worker, code, signal) => {
    logger.info(`Proceso ${worker.process.pid} caido!`)
    cluster.fork()
  })

  const expressSession = require('express-session')
  const { Server: HttpServer } = require('http')
   const app = express()
  const httpServer = new HttpServer(app)

  const productRouter = require('../routes/productRouter')
  const sessionRouter = require('../routes/sessionRouter')
  const infoRouter = require('../routes/infoRouter')

  const MongoStore = require('connect-mongo')
  const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(staticFiles))
  app.use(expressSession({
    store: MongoStore.create({
      mongoUrl: process.env.MONGOCREDENTIALSESSION,
      mongoOptions: advancedOptions
    }),
    secret: 'secret-pin',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000000
    }
  }))
  
   
  app.use('/session', sessionRouter)

  app.use('/api', productRouter)

  app.use('/info', infoRouter)

  app.get('*', (req, res) => {
    logger.warn(`Ruta: ${req.url}, metodo: ${req.method} no implemantada`)
    res.send(`Ruta: ${req.url}, metodo: ${req.method} no implemantada`)
  })


  let PORT = ( config.port) ? config.port : 8080

  if ( config.mode === 'CLUSTER') {
    PORT = config.same === 1 ? PORT + cluster.worker.id - 1 : PORT
  } 

  const server = httpServer.listen(PORT, () => {
    logger.info(`Servidor http escuchando en el puerto ${server.address().port}`)
  })
  server.on('error', error => loggererr.error(`Error en servidor ${error}`))
  
}


if ( config.mode != 'CLUSTER' ) { 

  logger.info('Server en modo FORK')
  baseProcces()
  } else { 
  
    if (cluster.isPrimary) {
      logger.info('Server en modo CLUSTER')
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }
    } else {
      baseProcces()
    }
  }