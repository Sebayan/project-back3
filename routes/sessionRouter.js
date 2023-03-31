const express = require('express')
const passport = require('passport')
require('../middlewares/auth')

const { Router } = express   
const sessionRouter = Router() 

const { users } = require('../class/userContainer')
const { logger, loggererr } = require('../log/logger')
const { sendEmail } = require('../messages/email')

const multer = require('multer')
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb( null, req.params.id + '.' + file.originalname.split('.').pop())
  }
})
const upload = multer ({
  storage: storage,
  limits: { fileSize: 1024 * 1024 }
})


sessionRouter.get(
  '/',
  async (req, res) => {
    if (req.session.passport) {
      const userData = await users.getUser( req.session.passport.user )
      if (userData) {
        logger.info(`Usuario ${req.session.passport.user} logeado`)
        res.status(200).send(userData)
      } else {
        res.status(401).send({})
      }  
    } else {
      logger.info(`No hay usuario logeado`) 
      res.status(401).send({})
    }
  }
)


sessionRouter.post(
  '/login', 
  passport.authenticate('login'),
  async (req, res) => {
    const userData = await users.getUser( req.session.passport.user )
    if (userData) {
      logger.info(`Usuario ${req.session.passport.user} logeado`)
      res.status(200).send(userData)
    } else {
      logger.warn(`No se pudieron recuperar los datos de ${req.session.passport.user} de la base de datos`)
      res.status(401).send({})
    }
  }
)



sessionRouter.post(
  '/register',
  passport.authenticate('register'),
  (req, res) => {
    if ( users.addUser ({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      address: req.body.address,
      age: req.body.age,
      phone: req.body.phone,
      photo: req.body.photo
    })) {
      logger.info(`Usuario creado correctamente`)
      sendEmail({
        from: 'Administrador',
        to: process.env.ADMINMAIL,
        subject: 'Nuevo usuario registrado',
        text: '',
        html: `
        <table>
          <tbody>
            <tr>
              <td>Username</td>
              <td>${req.body.username}</td>
            </tr>
            <tr>
              <td>Name</td>
              <td>${req.body.name}</td>
            </tr>
            <tr>
              <td>Address</td>
              <td>${req.body.address}</td>
            </tr>
            <tr>
              <td>Age</td>
              <td>${req.body.age}</td>
            </tr>
            <tr>
              <td>Phone</td>
              <td>${req.body.phone}</td>
            </tr>
            <tr>
              <td>Photo</td>
              <td>${req.body.photo}</td>
            </tr>
          </tbody>
        </table>`
      })
      res.status(200).send({ rlt: true, msg: 'Usuario creado correctamente'})
    } else {
      logger.warn(`No se ha podido crear usuario`)
      res.status(401).send({ rlt: false, msg: 'Usuario no creado'})
    }
    
  }
)


sessionRouter.post(
  '/register/img/:id',
  upload.single('userFileImage'),
  (req, res) => {
    res.status(200)
  }
)


sessionRouter.post(
  '/logout',
  async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        loggererr.error(`No se ha podido cerrar la sesion, error: ${error}`)
        res.status(500).send(`Something terrible just happened!!!`)
      } else {
        logger.info(`Sesion cerrada.`)
        res.redirect('/')
      }
    })
  }
)


module.exports = sessionRouter