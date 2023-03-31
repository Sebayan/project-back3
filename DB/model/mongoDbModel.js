const mongoose = require('mongoose')
const { Schema, model } = mongoose


const productSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: Number, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  thumbnail: { type: String, required: true }
})


const cartSchema = new Schema({
    timestamp: { type: Date, default: Date.now },
    products: { type: Array, required: true },
    username: { type: String, required: true }
})


const userSchema = new Schema({
  username: { type: String, required: true },
  password: {type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  photo: { type: String, required: true },
  cart: { type: Array, required: true } // el array se almacenara con el siguiente formato [ {idProd: , cant: }, { ..., ... }, .... ]
})


const chatSchema = new Schema({
  chatid: { type: String, required: true },
  chat: { type: Array, required: true } 
})



const productModel = model('Product', productSchema)
const cartModel = model('Cart', cartSchema)
const chatModel = model('Chat', chatSchema)
const userModel = model('User', userSchema)


module.exports = { productModel, cartModel, chatModel, userModel }