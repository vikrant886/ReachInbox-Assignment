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

let accessToken = "ya29.a0AXooCguR3Lm95KrdgHvxSfYtselC4jfrtruueO24I24UDrwzrRxRwHPelPkh7J0-aWco3YgHLHo-fR8nktR87QVA0aujHrgp9MF8f1DpQoZeNmmsiqdiFAvzMmH63NkESMWsZaQX2y8SG6f03nMSKbFWrASda1O72iPEaCgYKAUISARESFQHGX2MiQpSc-hJR9V5Gv279uI0rBA0171ya29.a0AXooCgtcf5U6KWtwuVHJmGKEuQc4leKJ-m_YPA5rP5RIvJZw25EuFxWQimw0Px8RovSD2mjUIhRxqDLSeuvD6FT4IzcWZqI00syx-d0tOpOdUxme8YNYhzS82NrOnHbXienJ2RhXeLavLG_WHhsoitntIvAqUUJJ5Ce_aCgYKAfQSARESFQHGX2MigtF_AfKCBPRax35_14CC7w0171";
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


//
// const sendMail = async (data, token) => {
//   try {
//     // const Token = accessToken;
//     if (!token) {
//       throw new Error("Token not found, please login again to get token");
//     }

//     const mailOptions = {
//       from: data.from,
//       to: data.to,
//       subject: "",
//       text: "",
//       html: "",
//     };
//     let emailContent = "";
//     if (data.label === "Interested") {
//       // Advertisement prompt
//       emailContent = `If the email mentions they are interested, do not generate any recipant's name instead use Dear user, your reply should give this advertisement i have express some key points below user then and create good reply for advertivement it shold render on email in bullet points
//       <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px;">
//       <p>We're excited to share with you how our product can benefit you:</p>
//       <ul>
//         <li><strong>Secure Mailing:</strong> Our platform offers end-to-end encryption to ensure your emails remain private and secure.</li>
//         <li><strong>Automated Emails:</strong> Easily automate your email workflows by setting timers and triggers. Schedule emails to be sent at specific times or based on user actions.</li>
//         <li><strong>Customizable Templates:</strong> Create personalized email templates and automate repetitive tasks, saving you time and effort.</li>
//       </ul>
//       <p>Would you like to learn more about how our platform can streamline your email communication? Feel free to reply to this email.</p>
//     </div>`;

//       mailOptions.subject = `User is : ${data.label}`;
//     } 

//     else if (data.label === "Not Interested") {
//       emailContent = `If the email mentions they are not interested, create a reply where we should ask them for feedback on why they are not interested. do not generate any recipant's name instead use Dear user.
//         Write a small text on the above request in around 100-150 words`;
//       mailOptions.subject = `User is : ${data.label}`;
//     } 

//     else if (data.label === "More Information") {
//       emailContent = `
//       If the email mentions they are interested to know more, your reply should give them more information about this product. Here are some of its key features:<br><br>
//       use this as heading for my reply. make it in bullet points but give style as none.
//       Thank you for expressing interest in our product! We're thrilled to share more details with you:

//       <p>Our product is a comprehensive email management platform designed to streamline your communication workflows.</p>
//       here are some features and benefits we can provide for user

//       <ul>
//       <li><strong>Google Authentication:</strong> Allow users to authenticate using their Google accounts.</li>
//       <li><strong>View User Profile:</strong> Retrieve and display user profile information such as name, email, and profile picture.</li>
//       <li><strong>View All Drafts:</strong> Fetch and display a list of all draft emails associated with the user's email address.</li>
//       <li><strong>Read Specific Email:</strong> Retrieve and display the content of a specific email using its ID.</li>
//       <li><strong>List Mails:</strong> Fetch and display a list of all emails associated with the user's email address.</li>
//       <li><strong>Send Email with Label:</strong> Allow users to send emails with a specified label (e.g., "Interested", "Not Interested", "More Information").</li>
//     </ul>
//         <strong>Send Email with Label:</strong> Allow users to send emails with a specified label (e.g., "Interested", "Not Interested", "More Information").`;

//       mailOptions.subject = `User wants : ${data.label}`;
//     }

//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo-0301",
//       max_tokens: 350,
//       temperature: 0.5,
//       messages: [
//         {
//           role: "user",
//           content: emailContent,
//         },
//       ],
//     });


//     const [heading, features, benefits] = response.choices[0].message.content.split('\n\n');

//     const headingHTML = `<h2>${heading}</h2>`;

//     const featuresHTML = `<ul style="list-style: none">${features.split('\n').map(feature => `<li style="list-style: none">${feature}</li>`).join('')}</ul>`;
//     const benefitsHTML = `<ul style="list-style: none">${benefits.split('\n').map(feature => `<li style="list-style: none">${feature}</li>`).join('')}</ul>`;

//     mailOptions.text = `${heading}\n\n${features}`;
//     mailOptions.html = `
//       <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; ">
//         ${headingHTML}
//         ${featuresHTML}
//         ${benefitsHTML}
//       </div>`;

//       const emailData = [
//         'Content-type: text/html;charset=iso-8859-1',
//         'MIME-Version: 1.0',
//         `from: ${data.from}`,
//         `to: ${data.to}`,
//         `subject: ${mailOptions.subject}`,
//         `text: ${mailOptions.text}`,
//         `html: ${mailOptions.html}`,
//   ].join('\n');



//       const sendMessageResponse = await axios.post(`https://gmail.googleapis.com/gmail/v1/users/${data.from}/messages/send`,{raw:Buffer.from(emailData).toString(`base64`)}, {
//         headers: {
//           "Content-Type" : "application/json",
//           'Authorization': `Bearer ${token}`
//         }
//       });


//     let labelId;
//     switch (data.label) {
//       case "Interested":
//         labelId = "Label_1";
//         break;
//       case "Not Interested":
//         labelId = "Label_2";
//         break;
//       case "More Information":
//         labelId = "Label_3";
//         break;
//       default:
//         break;
//     }

//     const labelUrl = `https://gmail.googleapis.com/gmail/v1/users/${data.from}/messages/${sendMessageResponse.data.id}/modify`;
//     const labelConfig = {
//       method: 'POST',
//       url: labelUrl,
//       headers: {
//         'Authorization': `Bearer ${token}`
//       },
//       data: {
//         addLabelIds: [labelId]
//       }
//     };
//     const labelResponse = await axios(labelConfig);

//     console.log(sendMessageResponse.data.id)
//     return sendMessageResponse.data.id.result;
//   } catch (error) {
//     console.log(error)
//     throw new Error("Can't send email: " + error.message);

//   }
// };

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

        // console.log(val)

        // Create a prompt for OpenAI using the received email content
        const emailContent = `The user received the following email: subject: "${subject} message: "${message}" from "${from} and i am Vikrant Rana from ReachInbox and you are writing message from myside to the clients for reachInbox. Based on this, i want you to professional geneterate a message as the response to the mail . If interested tell more about ReachInbox and how they can provide you to enhance you mailing experience, If not interested Ask them why are you not interested and how can we make it better for other users as a feedback. If more info req, If the email mentions they are interested to know more, your reply should ask them if they are willing to hop on to a demo call by suggesting a time.`
        const result = await model.generateContent(emailContent);
        const response = await result.response;
        const text = response.text();
        // console.log(text);
        content = text

        const mailOptions = {
            from,
            to,
            predictedLabel:val,
            data: content
        };

        console.log("***maildata", mailOptions)

        // const sendMessageResponse = await axios.post(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, emailData, {
        //     headers: {
        //         "Content-Type": "application/json",
        //         'Authorization': `Bearer ${accessToken}`
        //     }
        // });

        res.json({mailOptions});
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
};
