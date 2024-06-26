const axios = require("axios");
const express = require("express");
require("dotenv").config();
const { createConfig } = require("../helper/config");
const { OAuth2Client } = require("google-auth-library");
// const { connection } = require("../middlewares/redis.middleware");
const googleRouter = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// google oauth
const oAuth2Client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.modify",
];

const signin = (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
    });
    res.redirect(authUrl);
};

let accessToken = "ya29.a0AXooCgtbK_ZFMr1C2Qg3ly4lmZvJ5fzKyS0ZrFNhsnB24GPRLkHGFg8J8D_YE1AnGY2yvvK_i4pcR5BVG8U0A9CtO44U2VDtjLdp_p2r9WNre0mRRLPFtiDhnFDpQFG0hOAzq1zy7Djqciod4A_F2JtDsDzu7t_ecD9RaCgYKAXUSARMSFQHGX2MiTjMjz-oEO50Y9N0WK3PbPQ0171"
const callback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("Authorization code missing.");
    }

    try {
        const { tokens } = await oAuth2Client.getToken(code);

        const { access_token, refresh_token, scope } = tokens;

        accessToken = access_token;
        console.log(accessToken)

        res.redirect("http://localhost:3000/home?type=gmail");
    } catch (error) {
        console.error("Error exchanging authorization code:", error.message);
        res.status(500).send("Error exchanging authorization code.");
    }
};

// git user profile details
const getUser = async (req, res) => {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/profile`;

        const token = accessToken;
        // connection.setex(req.params.email, 3600, token);

        if (!token) {
            return res.send("Token not found , Please login again to get token");
        }

        const config = createConfig(url, token);

        const response = await axios(config);

        res.json(response.data);
    } catch (error) {
        console.log("Can't get user email data ", error.message);
        res.send(error.message);
    }
};

const getMails = async (req, res) => {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10`;

        const token = accessToken;
        console.log("got mails");

        if (!token) {
            return res.status(401).send("Token not found. Please log in again to get the token.");
        }

        const config = createConfig(url, token);

        const response = await axios(config);
        const mails = await getEachMail(response.data);
        res.json(mails);
    } catch (error) {
        console.log("Can't get user email data", error.message);
        res.status(500).send(error.message);
    }
};

const getEachMail = async (data) => {
    const messages = data.messages;
    const promises = messages.map(async (val) => {
        const mailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${val.id}`;
        const mailConfig = createConfig(mailUrl, accessToken);
        const response = await axios(mailConfig);

        const headers = response.data.payload.headers.reduce((acc, header) => {
            if (header.name === "From") {
                acc.senderName = header.value;
            } else if (header.name === "Subject") {
                acc.subject = header.value;
            }
            return acc;
        }, {});

        return {
            id: response.data.id,
            senderName: headers.senderName || "Unknown Sender",
            subject: headers.subject || "No Subject",
            message: response.data.snippet
        };
    });
    const mails = await Promise.all(promises);
    return mails;
};



const sendMail = async (req, res) => {
    try {
        const {emailData,from} =req.body
        console.log("for sendding ", emailData,from)
        const sendMessageResponse = await axios.post(`https://gmail.googleapis.com/gmail/v1/users/${from}/messages/send`, emailData, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`
            }
        });

    } catch (error) {
        console.log(error)
        throw new Error("Can't send email: " + error.message);

    }
};

const getMailContent = async (messageId, messtype) => {
    try {
        if (messtype === "gmail") {
            console.log("messageid is: ", messageId)
            const mailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
            const mailConfig = createConfig(mailUrl, accessToken);
            const response = await axios(mailConfig);
            const messageBody = response.data.snippet;
            console.log(messageBody)
            return messageBody;
        }
        else {
            const url = `https://graph.microsoft.com/v1.0/me/messages/${messageId}`;
            const token = accessToken
            const config = createConfig(url, token);
            const response = await axios(config);
            let data = await response.data;
            console.log(data)
            return data;
        }
    } catch (error) {
        console.error("Error fetching email content:", error.message);
        throw new Error("Can't fetch email content: " + error.message);
    }
};

const aiResponseGen = async (req, res) => {
    try {
        // console.log(req)
        const { from, to, label, messageId, message, subject } = req.body;

        if (!accessToken) {
            throw new Error("Token not found, please login again to get token");
        }
        const maillabel = `email: subject: "${subject} message: "${message}" from "${from} . Based on this mail, generate one word categorizing the mail into Interested, Not Interested and More information required. `
        const answer = await model.generateContent(maillabel);
        const resp = await answer.response;
        const val = resp.text();

        console.log(val)

        // Create a prompt for OpenAI using the received email content
        const emailContent = `The user received the following email: subject: "${subject} message: "${message}" from "${from} and i am Vikrant Rana from ReachInbox and you are writing message from myside to the clients for reachInbox. Based on this, i want you to professional geneterate a message that only contaiins the body of the mail, not subject and not greetings as the response to the mail . If interested tell more about ReachInbox and how they can provide you to enhance you mailing experience, If not interested Ask them why are you not interested and how can we make it better for other users as a feedback. If more info req, If the email mentions they are interested to know more, your reply should ask them if they are willing to hop on to a demo call by suggesting a time.`
        const result = await model.generateContent(emailContent);
        const response = await result.response;
        const text = response.text();
        console.log(text);
        content = text
        // const content = openAIResponse.data.choices[0]?.message?.content;
        // console.log(content);

        const mailOptions = {
            from,
            to,
            predictedLabel: val,
            data: content
        };

        console.log("***maildata", mailOptions)

        const emailData = {
            raw: Buffer.from(
                `Content-Type: text/html;charset=UTF-8\nMIME-Version: 1.0\nfrom: ${mailOptions.from}\nto: ${mailOptions.to}\nsubject: ${mailOptions.subject}\n\n${mailOptions.html}`
            ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        };

        console.log("****email Data", emailData)


        res.json({ mailOptions, emailData });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Can't send email: " + error.message);
    }
};

module.exports = {
    getUser,
    signin,
    callback,
    getMails,
    aiResponseGen,
    sendMail,
};
