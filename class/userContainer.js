const connectToDd = require('../DB/config/connectToMongo')
const { userModel } = require('../DB/model/mongoDbModel')

const bcrypt = require('bcrypt')
const saltRounds = 10

const { logger, loggererr } = require('../log/logger')


class Container {
  constructor( schema ) {
      this.schema = schema
  }
  

  async checkUser( username, password ) {
    try {
      await connectToDd()
      const documentInDb = await this.schema.find({ username: username })
      if ( documentInDb.length > 0 ) {
        if ( bcrypt.compareSync( password, documentInDb[0].password ) ) {
          return { msg: '', result: true }
        } else {
          logger.info(`Se ha intentado logear ${username} con una contrasena incorrecta`)
          return { msg: 'Contrasena incorrecta', result: false }
        }
      } 
      return { msg: 'No existe usuario', result: false }
    } catch(err) {
      loggererr.error(`Error: ${err}`)
    }
  }


  async userInDb( username ){
    try {
      await connectToDd()
      const documentInDb = await this.schema.find({ username: username })
      if ( documentInDb.length > 0 ) {
        return true
      } else {
        return false
      }
    } catch(err) {
      loggererr.error(`Error: ${err}`)
    }
  }
  

  async getUser( username ) {
    try {
      await connectToDd()
      const documentInDb = await this.schema.find({username: username})
      return documentInDb ? documentInDb : null
    } catch {
      loggererr.error(`Error: ${err} al intentar recuperar el usuario id:${username} de la base de datos`)
    }
  }



  async addUser( object ) {
    try{
      const encriptedPassword = bcrypt.hashSync(object.password, saltRounds)
      await connectToDd()
      const newUser = new userModel({
         username: object.username,
         password: encriptedPassword,
         name: object.name,
         address: object.address,
         age: object.age,
         phone: object.phone,
         photo: object.photo,
         cart: []
         })
      await newUser.save()
        .then(user => logger.info(`Se ha agregado a la base de datos elemento con id: ${user._id}`))
        .catch(err => loggererr.error(`Se ha produciodo error ${err} al intentar agregar un usuario a la base de datos`))
        return true
    } catch(err) {
      loggererr.error(`Se ha produciodo error ${err} al intentar agregar un usuario a la base de datos`)
    }
  }


  async addProductToCart ( username, idProd, cantidad ) {
    try {
      await connectToDd()
      const userData = await this.schema.find(      
          { username: username }
      )
      let isNotInCart = true
      userData[0].cart.forEach(element => {
        if (element.id == idProd) isNotInCart = false 
      })
      if ( isNotInCart ) {
        await this.schema.updateOne(
          { username: username },
          { $push: { cart: { id: idProd, cant: cantidad } } }
        )
      } else {
        await this.schema.updateOne(
          { username: username, "cart.id": idProd },
          { $inc: { "cart.$.cant": cantidad } }
        )
      }
      logger.info(`Se agregador el producto ${idProd} al carrito de ${username}`)
      
    } catch(err) {
      loggererr.error(`Error: ${err}`)
    }
  }


  async delCart ( username ) {
    try {
      await connectToDd()
      await this.schema.updateOne(
        { username: username },
        { $set: { cart: [] } }
      )
    } catch(err) {
      loggererr.error(`Error: ${err} al intentar borrar carrito de ${username}`)
    }
  }


}

const users = new Container( userModel )

module.exports = { users } 