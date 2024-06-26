const express = require("express")
const cors = require("cors")
const app = express()
const session = require("express-session");
const cookieParser = require("cookie-parser");
const outlookrouter = require("./routes/outlook.route")
const gmailrouter = require("./routes/gmail.route")
require("dotenv").config()
const bodyparser = require('body-parser');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(cors())
app.use(
    session({
        secret: "any_secret_key",
        resave: false,
        saveUninitialized: false,
    })
);
console.log(process.env.OPENAI_API_KEY)

app.get("/", (req, res) => {
    res.send("hello there")
})
app.use("/outlook", outlookrouter)
app.use("/gmail", gmailrouter)

app.listen(8000, () => {
    console.log("server listening at 8000");
})