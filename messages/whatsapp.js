const client = require('twilio')(process.env.MSGACCOUNTSID, process.env.MSGAUTHTOKEN);


const sendWa = async ( waMsg ) => {
  client.messages.create({
        body: waMsg.body,
        from: process.env.WANUMBER,
        to: `whatsapp:${waMsg.to}`
    })
    .then(message => console.log(message.sid))
}
  
module.exports = { sendWa }