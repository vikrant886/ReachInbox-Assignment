const express = require("express")
const cors = require("cors")
const app = express()
const session = require("express-session");
const cookieParser = require("cookie-parser");
const outlookrouter = require("./routes/outlook.route")
require("dotenv").config()

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

app.listen(8000, () => {
    console.log("server listening at 8000");
})