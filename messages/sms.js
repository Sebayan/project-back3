const twilio = require('twilio')

const sendSMS = async ( sms ) => {
  const client = twilio( process.env.MSGACCOUNTSID, process.env.MSGAUTHTOKEN )
  const message = await client.messages.create({
    body: sms.body,
    from: process.env.SMSNUMBER,
    to: sms.number
  })
  return
}

module.exports = { sendSMS }