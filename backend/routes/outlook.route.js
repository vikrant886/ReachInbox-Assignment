const express = require('express');
const app = express();
const outlookRouter = express.Router();
const {
    signin,
    callback,
    getMails,
    readMail,
    getUser,
    sendMail,
    // sendMail
} = require("../controller/Outlook.controller");

outlookRouter.use(express.json());
outlookRouter.use(express.urlencoded({ extended: true }));

//Routes
outlookRouter.get('/signin', signin);
outlookRouter.get('/callback', callback);
outlookRouter.get('/profile', getUser);
outlookRouter.get('/all-Mails/:email', getMails);
outlookRouter.get('/:email/read-Msg/:message', readMail);
outlookRouter.post('/send',sendMail)


module.exports = outlookRouter;
