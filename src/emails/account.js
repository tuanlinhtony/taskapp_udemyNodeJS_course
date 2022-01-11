const mailjet = require ('node-mailjet')
.connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)
// Currently, I can't use Email Delivery Service of Sendgrid Api, the Mailjet Api will Email Delivery Service instead of it 

const sendWelcomeEmail = (email, name) => {
    const request = mailjet.post("send", {'version': 'v3.1'})
    .request({
        "Messages":[{
            "From": {
                "Email": "tuanlinhtony@outlook.com",
                "Name": "Tony Pilot"
            },
            "To": [{
                "Email": email,
                "Name": "passenger 1"
            }],
            "Subject": "Thanks for joining in!",
            "TextPart": 'Welcome to the app,' + name + '. Let me know how you get along with the app',
            "HTMLPart": "<h3>Welcome to the app, " + name + ".</h3><br/>Let me know how you get along with the app!"
        }]
    })
    request
    .then((result) => {
        console.log(result.body)
    })
    .catch((err) => {
        console.log(err.statusCode)
    })
}

const sendCancelationEmail = (email, name) => {
    const request = mailjet.post("send", {'version': 'v3.1'})
    .request({
        "Messages":[{
            "From": {
                "Email": "tuanlinhtony@outlook.com",
                "Name": "Tony Pilot"
            },
            "To": [{
                "Email": email,
                "Name": "passenger 1"
            }],
            "Subject": "Your account was cancelation!",
            "TextPart": 'Thanks for used our app,' + name + '. We hope our app had brought the sastifaction to you',
            "HTMLPart": "<h3>Thanks for used our app, " + name + ".</h3><br/>We hope our app had brought the sastifaction to you!"
        }]
    })
    request
    .then((result) => {
        console.log(result.body)
    })
    .catch((err) => {
        console.log(err.statusCode)
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
} 
