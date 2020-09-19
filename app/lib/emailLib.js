const nodemailer = require('nodemailer');

let sendEmailToUser = (sendEmailObj) => {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sherpaphurba37@gmail.com',
            pass: 'phursangg'
        }
    });

    // setup email data 
    let mailOptions = {
        from: '"OMS : " <sherpaphurba37@gmail.com>', // sender address
        to: sendEmailObj.email, // list of receivers
        subject: sendEmailObj.subject, // Subject line
        html: sendEmailObj.html // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        else {
            console.log('Message successfully sent.', info);
        }

    });

}

module.exports = {
    sendEmailToUser
}
