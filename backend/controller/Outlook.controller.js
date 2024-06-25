const express = require("express");
require("dotenv").config();
const { createConfig } = require("../helper/config")
const axios = require("axios");
// const { connection, redisGetToken, } = require("../middlewares/redis.middleware");
const { ConfidentialClientApplication } = require("@azure/msal-node");

const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRECT_KEY });

const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const redirectUri = "http://localhost:8000/outlook/callback";
// const redirectUri ="https://reachinbox-assignment-4rf9.onrender.com/outlook/callback";
const scopes = ["user.read", "Mail.Read", "Mail.Send"];

const ccaConfig = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/common`,
        clientSecret,
    },
};

const cca = new ConfidentialClientApplication(ccaConfig);

const signin = (req, res) => {
    const authCodeUrlParameters = {
        scopes,
        redirectUri,
    };

    cca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
        console.log("good")
        // console.log(response)
        res.redirect(response);
    });
};

let accessToken="EwCYA8l6BAAUbDba3x2OMJElkF7gJ4z/VbCPEz0AAemknJKekLpxyMDy4SbNb1ok3yQm6ZalwdSLnTUn0W4pQ8gBBuuFSt1SiihT+A/tR222otmhn9ErbCGAmizd4Josx78YhIxsT8ORV6wh3V6efGiksrSKswdS+BHANtE21Ud++9NnUfskbEtPDOAuIgNUDGZlBpWh+R+Mk7Q4lHL+YU73fj80fU+sqcxNbLh54vOp5/xQGJDOKvPvZViSK1n7ktV1jHi8pnz+lZFZ4291SdlV/dZDfm4jDsLTzefRc1yOaI/A1K30MeaXMfVu3Sorh7nzN6ZfZKf5lB3uexGeUDp5JkRvKVj9uNY+WuKM+nxBP+8kUqsfnRk429ebNTcDZgAACHBYMXxiYtPWaAJ1a2vACCg23MQZijeK4UYm/N33nwkOfx8Zr0EHXVIh8qqS8W9Jw1HMTCe+oG4Aphqnch122YzLgMIuAAyi+DY8KHFUBnXz0t+F8EsqAoCSvwmCqkzdDQnRCXi+oKxVJEgMyR3DpbJ+sWWrI1f1spv3BdHrxkPLfI8tSljv6ty5KUusZ9LjwsGssibn71urqbU7ewoS9TupqcuRg2PYmTECfuEp8+cInrCWx0co3K0lYI6EXxMArdXpN3UFco0jaI3FliG6FmCOeIPtP1sCSuflJTv+Oi5XpnIEDSqPoYM7qGDzmCrGFLJCcfXDyBvuUDzU42iqstVFrDgrtFWUtuZn+r8dj7cifeTYEwg/u0Xhr5X8OpZIJ6JzD1QGjy61ISZY1WPfpdghrF6zyt84iCgf65bKUCsAQPr9+Nkl6IgmfZOMoCtWGcvJnwVkNnUqJisyx9a2tU4NmamdG+ElFVQBzGJbBJhD8FvmzEYFJfeivN5U5Asfe5WmHhTyOOM4LGCemH734w66dlGIURjIUszVQhcoPi2+mEf7dgytT6SqMWQcv58cCmXdx9sdOFwgqZZbqPXK/EBL7tSPqkSqB27yjDMFu54H6TkpljjsfPzfnbyEw6Mb4lePIPULF+bwr+zfTaayyKzUUaUabMo9IOm64HKWNijHAWC0Y1QoHmMp3LtwcVtuMBlhOOYBTeNer1wDYmWrIh/du9WKF64bww4/7494954t5f0vUMtYofHylfHubn6ZMYmLQ/4W4BHfcxpapuMHiXto7dgn79nNOfDiZxZk0DfolQ6+QArhtDLaCM52qZzN+EE4jwI=";

const callback = async (req, res, getUser) => {
    const { code } = req.query;
    console.log("the code is: ", code);

    if (!code) {
        return res.status(400).send("Authorization code missing.");
    }

    try {
        const tokenRequest = {
            clientId: process.env.AZURE_CLIENT_ID,
            code,
            scopes: ["user.read", "Mail.Read", "Mail.Send"],
            redirectUri: "http://localhost:8000/outlook/callback",
            clientSecret: process.env.AZURE_CLIENT_SECRET,
        };
        console.log("Token Request:", tokenRequest);
        const response = await cca.acquireTokenByCode(tokenRequest);
        req.session.accessToken = response.accessToken;
        accessToken = response.accessToken;
        console.log(accessToken);
        res.status(200).send({ msg: "user is authorized" });
    } catch (error) {
        console.error("Error exchanging authorization code:", error.message);
        res.status(500).send("Error exchanging authorization code.");
    }
};

const getUser = async (req, res) => {
    try {
        const url = `https://graph.microsoft.com/v1.0/me`;

        const token = accessToken;

        if (!token) {
            return res.send("Token not found , Please login again to get token");
        }

        const config = createConfig(url, token);

        const response = await axios(config);
        // connection.setex(response.data.mail, 3600, token);

        res.json(response.data);
        console.log(response)
        // console.log(atoken);
    } catch (error) {
        console.log("Can't get user email data ", error.message);
        res.send(error.message);
    }
};

const getMails = async (req, res) => {
    try {
        const url = `https://graph.microsoft.com/v1.0/me/messages?maxResults=50`;

        // const token = await redisGetToken(req.params.email);
        const token=accessToken
        console.log(token);
        if (!token) {
            return res.send("Token not found , Please login again to get token");
        }
        const config = createConfig(url, token);
        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        res.send(error.message);
        console.log("Can't get emails ", error.message);
    }
};

const readMail = async (req, res) => {
  try {
    const url = `https://graph.microsoft.com/v1.0/me/messages/${req.params.message}`;
    console.log(req.params)

    // const token = await redisGetToken(req.params.email);
    const token = accessToken

    const config = createConfig(url, token);
    const response = await axios(config);
    let data = await response.data;
    res.json(data);
  } catch (error) {
    res.send(error.message);

    console.log("Can't read mail ", error.message);
  }
};

const sendMail = async (data, token) => {
  try {
    if (!token) {
      throw new Error("Token not found, please login again to get token");
    }

    let emailContent = "";
    let subject = "";
    if (data.label === "Interested") {
      emailContent = `If the email mentions they are interested, do not generate any recipient's name instead use Dear user, your reply should give this advertisement i have express some key points below user then and create good reply for advertisement it should render on email in bullet points

      We're excited to share with you how our product can benefit you:
      - Secure Mailing: Our platform offers end-to-end encryption to ensure your emails remain private and secure.
      - Automated Emails: Easily automate your email workflows by setting timers and triggers. Schedule emails to be sent at specific times or based on user actions.
      - Customizable Templates: Create personalized email templates and automate repetitive tasks, saving you time and effort.

      Would you like to learn more about how our platform can streamline your email communication? Feel free to reply to this email.`;
      subject = `User is : ${data.label}`;
    } else if (data.label === "Not Interested") {
      emailContent = `If the email mentions they are not interested, create a reply where we should ask them for feedback on why they are not interested. do not generate any recipient's name instead use Dear user. Write a small text on the above request in around 100-150 words`;
      subject = `User is : ${data.label}`;
    } else if (data.label === "More Information") {
      emailContent = `If the email mentions they are interested to know more, your reply should give them more information about this product. Here are some of its key features:

      Thank you for expressing interest in our product! We're thrilled to share more details with you:
      - Google Authentication: Allow users to authenticate using their Google accounts.
      - View User Profile: Retrieve and display user profile information such as name, email, and profile picture.
      - View All Drafts: Fetch and display a list of all draft emails associated with the user's email address.
      - Read Specific Email: Retrieve and display the content of a specific email using its ID.
      - List Mails: Fetch and display a list of all emails associated with the user's email address.
      - Send Email with Label: Allow users to send emails with a specified label (e.g., "Interested", "Not Interested", "More Information").`;
      subject = `User is : ${data.label}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0301",
      max_tokens: 350,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: emailContent,
        },
      ],
    });

    const [heading, features, benefits] =
      response.choices[0].message.content.split("\n\n");
    const headingHTML = `<h2>${heading}</h2>`;
    const featuresHTML = `<ul>${features.split("\n").map((feature) => `<li>${feature}</li>`).join("")}</ul>`;
    const benefitsHTML = `<ul>${benefits.split("\n").map((feature) => `<li>${feature}</li>`).join("")}</ul>`;

    const mailOptions = {
      message: {
        subject: subject,
        body: {
          contentType: "HTML",
          content: `
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; ">
              ${headingHTML}
              ${featuresHTML}
              ${benefitsHTML}
            </div>`,
        },
        toRecipients: [
          {
            emailAddress: {
              address: data.to,
            },
          },
        ],
      },
      saveToSentItems: false,
    };

    const url = "https://graph.microsoft.com/v1.0/me/sendMail";
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const sendMailResponse = await axios.post(url, mailOptions, { headers });
    return sendMailResponse.data;
  } catch (error) {
    throw new Error("Can't send email: " + error.message);
  }
};

module.exports = {
    getUser,
    signin,
    callback,
    getMails,
      readMail,
      sendMail,
};
