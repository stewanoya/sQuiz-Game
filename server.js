// load .env data into process.env
// require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
let cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

app.use(
  cookieSession({
    name: "session",
    // shoutout to anyone that gets the reference
    keys: ["The Temp at Night."],
  })
);
// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/api");
const quizzesRoutes = require("./routes/quizzes");
const createquizRoutes = require("./routes/create-quiz");
const widgetsRoutes = require("./routes/widgets");
const searchRoutes = require("./routes/search");
const registerUserRoutes = require("./routes/register");
const logoutRoutes = require("./routes/logout");
const loginRoutes = require("./routes/login");
const myQuizzesRoutes = require("./routes/my-quizzes");
const myResultsRoutes = require("./routes/my-results");
const deleteQuizRoutes = require("./routes/delete-quiz");
const editQuizRoutes = require("./routes/edit-quiz");
const resultShareRoutes = require("./routes/result-share");
const quizStartRoutes = require("./routes/quiz-start");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api", usersRoutes(db));
// app.use("/quizzes", quizzesRoutes(db));
// app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.use("/new-quiz", createquizRoutes(db));
app.use("/register", registerUserRoutes(db));
app.use("/search", searchRoutes(db));
app.use("/logout", logoutRoutes());
app.use("/login", loginRoutes(db));
app.use("/my-quizzes", myQuizzesRoutes(db));
app.use("/quizzes", quizzesRoutes(db));
app.use("/my-results", myResultsRoutes(db));
app.use("/delete", deleteQuizRoutes(db));
app.use("/edit", editQuizRoutes(db));
app.use("/result", resultShareRoutes(db));
app.use("/quiz-start", quizStartRoutes(db));

app.get("/", (req, res) => {
  const session = req.session["id"];
  db.query(`SELECT * from quizzes LIMIT 15;`)
    .then((data) => {
      const quizzes = data.rows;
      return quizzes;
    })
    .then((quizzes) => {
      const templateVars = { quizzes, session };
      res.render("index", templateVars);
    })
    .catch((err) => {
      console.log("this is the error", err.message);
      return err.message;
    });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

exports.db = db;
