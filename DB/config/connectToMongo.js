const mongoose = require('mongoose')
const { logger, loggererr } = require('../../log/logger')

let isConected

const connectToDd = async () => {
  if(!isConected) {
    mongoose.set('strictQuery', true)
    await mongoose.connect(process.env.MONGOCREDENTIALSECOMMERCE,
    { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
          isConected = true
          logger.info('MongoDB Connected...')})
        .catch(err => console.log(err))   
    return
  }
  return
}

module.exports = connectToDd 