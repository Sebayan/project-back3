const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: process.env.EMAILSERVICE,
  port: Number(process.env.EMAILPORT),
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.EMAILPASS
  },
  tls: {
    rejectUnauthorized: false
  }
})


const sendEmail = async ( email ) => {
  const info = await transporter.sendMail({
    from: email.from,
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html
  })
  return info
}


module.exports = { sendEmail }