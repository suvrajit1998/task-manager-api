const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'guhashati@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to the App, ${name}. Let me know how you get along with the app.`
  })
}

const cancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'suvrajitnaskar1998@gmail.com',
    subject: 'Sorry to see you go!',
    text: `GoodBye ${name} I hope to see you back sometime soon.`
  })
}

module.exports = {
  sendWelcomeEmail,
  cancelationEmail
}
