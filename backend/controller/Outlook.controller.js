const express = require("express");
require("dotenv").config();
const { createConfig } = require("../helper/config")
const axios = require("axios");
const { ConfidentialClientApplication } = require("@azure/msal-node");

const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRECT_KEY });

const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const redirectUri = "http://localhost:8000/outlook/callback";
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
        res.redirect("http://localhost:3000/home?type=outlook"); 
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
        res.json(response.data);
        console.log(response)
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
        const parsedData = await parseMail(response.data)
        res.json(parsedData);
    } catch (error) {
        res.send(error.message);
        console.log("Can't get emails ", error.message);
    }
};

const parseMail = async (data) => {
  const mails = data.value;
  const parsedData = mails.map(element => ({
      id: element.id,
      senderAddress: element.sender.emailAddress.address,
      senderName: element.sender.emailAddress.name,
      subject: element.subject,
      message: element.bodyPreview,
  }));

  console.log(parsedData); 
  return parsedData; 
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

module.exports = {
    getUser,
    signin,
    callback,
    getMails,
    readMail,
      // sendMail,
};
