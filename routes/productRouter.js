const express = require('express')
const { products } = require('../class/productContainer')
const { users } = require('../class/userContainer')


const { Router } = express   
const productRouter = Router() 

const { logger, loggererr } = require('../log/logger')
const { sendEmail } = require('../messages/email')
const { sendSMS } = require('../messages/sms')
const { sendWa } = require('../messages/whatsapp')
const { generateTable } = require('../api/jsonToHtml')


productRouter.get(
  '/productos',
  async (req, res) => {
    const allProducts = await products.getAll()
    logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
    res.json( allProducts )
  }
)


productRouter.get(
  '/productos/:id',
  async (req, res) => {
    const id = Number(req.params.id)
    const product = await products.getById( id )
    if ( product ) {
      logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
      res.json( product )
    } else {
      loggererr.error(`Producto id: ${id} no encontrado`) 
      res.status(404).send({ error: 'producto no encontrado'})
    }
  }
)


productRouter.get(
  '/carrito/:username',
  async (req, res) => {
    const username = req.params.username
    const userData = await users.getUser( username )
    res.status(200).send({ cart: userData })
  }
)


productRouter.post(
  '/carrito/addproduct',
  async (req, res) => {
    await users.addProductToCart( req.body.username, req.body.productId, 1)
    res.status(200).send({msg: 'todo precioso'})
  }
)


productRouter.get(
  '/carrito/compra/:username',
  async (req, res) => {
    const username = req.params.username
    const userData = await users.getUser( username )
    const productList = []
   
    for ( const element of userData[0].cart ) {
      const item = await products.getById( element.id )
      productList.push({ 
        title: item[0].title,
        code: item[0].code,
        cant: element.cant
       })
    }

    sendEmail({
      from: 'Administrador',
      to: process.env.ADMINMAIL,
      subject: `Nuevo pedido de ${username}`,
      text: '',
      html: generateTable( productList )
    })

    sendWa({
      body: `Nuevo pedido de ${username}`,
      to: userData[0].phone
    })

    sendSMS({
      body: 'Pedido recibido y en proceso',
      number: userData[0].phone
    })
    
    res.status(200).send({ cart: userData })
  }
)


productRouter.post(
  '/productos',
  async (req, res) => {
    const productToAdd = req.body
    await products.add( productToAdd )
    logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
    res.redirect('/')
  }
)


productRouter.put(
  '/productos/:id',
  async (req, res) => {
    const id = Number(req.params.id)
    const productToModify = req.body

    if(await products.modifyById( id, productToModify )){
      logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
      res.send({ message: 'producto modificado'})
    } else {
      loggererr.error(`Producto id: ${id} no encontrado`) 
      res.status(404).send({ error: 'producto no encontrado'})
    }
  }
)


productRouter.delete(
  '/productos/:id',
  async (req, res) => {
    const id = req.params.id
    if (await products.deleteById(id)) {
      logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
      res.send({ message: 'producto borrado'})
    } else {
      loggererr.error(`Producto id: ${id} no encontrado`) 
      res.status(404).send({ error: 'producto no encontrado'})
    }
  }
) 



module.exports = productRouter