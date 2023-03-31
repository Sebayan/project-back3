const connectToDd = require('../DB/config/connectToMongo')
const { productModel } = require('../DB/model/mongoDbModel')

const { logger, loggererr } = require('../log/logger')

class Container {

  constructor( schema ) {
      this.schema = schema
  }
  

  async getAll() {
    try{
      await connectToDd()
      const documentsInDb = await this.schema.find()
      return documentsInDb
    } catch(err) {
      loggererr.error(`Error: ${err} al intentar recuperar los productos de la base de datos`)
    }
  }
 


  async getById( id ) {
    try {
      await connectToDd()
      const documentInDb = await this.schema.find({_id: id})
      return documentInDb ? documentInDb : null
    } catch(err) {
      loggererr.error(`Error: ${err} al intentar recuperar el producto id:${id} de la base de datos`)
    }
  }


  async deleteById( id ) {  
    try {
      await connectToDd()
      await this.schema.deleteOne({ _id: id })
      return 
    } catch(err) {
      loggererr.error(`Error: ${err} al intentar borrar el producto id:${id} en la base de datos`)
      return false
    }
  }


  async deleteAll() {
    try {
      await connectToDd()
      await this.schema.deleteMany()
      return 
    } catch(err) {
      loggererr.error(`Error: ${err} al intentar borrar todos los productos de la base de datos`)
      return false
    }
  }


  async add( item ) {
    try{
      await connectToDd()
      const newProduct = new productModel( item )
      await newProduct.save()
        .then(product => logger.info(`Se ha agregado a la base de datos elemento con id: ${product._id}`))
        .catch(err => loggererr.error(`Error: ${err} al intentar guardar el producto id: ${product._id} en la base de datos`))
      return
    } catch(err) {
      loggererr.error(`Error: ${err} al intentar guardar el producto id: ${product._id} en la base de datos`)
    }
  }

}

const products = new Container( productModel )

module.exports = { products } 