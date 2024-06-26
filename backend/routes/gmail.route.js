const express = require('express');
const app = express();
const gmailRouter = express.Router();
const {
    signin,
    callback,
    getMails,
    // readMail,
    getUser,
} = require("../controller/Gmail.controller");

gmailRouter.use(express.json());
gmailRouter.use(express.urlencoded({ extended: true }));

//Routes
gmailRouter.get('/signin', signin);
gmailRouter.get('/callback', callback);
gmailRouter.get('/profile', getUser);
gmailRouter.get('/all-Mails', getMails);
// gmailRouter.get('/:email/read-Msg/:message', readMail);


module.exports = gmailRouter;
