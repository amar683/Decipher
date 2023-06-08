var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const ejs = require('ejs');
const pathTo = require('path');
var fs = require('fs');

const sendMail = (req)=>{

    var readHTMLFile = function(path, callback) {
        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };
    
    smtp_transport = nodemailer.createTransport(smtpTransport({
        service:'gmail',
        auth: {
            user: 'decipherDiscuss@gmail.com',
            pass: '@decipher.com'
        }
    }));
    
    readHTMLFile(pathTo.join(__dirname,"../../views/email.ejs"), function(err, html) {
        var template = ejs.compile(html);
        var replacements = {
             username: req.body.name,
             emailId: req.body.email,
             query: req.body.query 
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: 'decipherDiscuss@gmail.com',
            to : 'decipherDiscuss@gmail.com',
            subject : 'Query',
            html : htmlToSend
         };
        smtp_transport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                callback(error);
            }
        });
    });
}

module.exports = {sendMail}