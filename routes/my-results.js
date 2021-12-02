const express = require("express");
const router = express.Router();

const myResults = (db) => {
  router.get("/", (req, res) => {
    const user_id = req.session.id;

    if (!user_id) {
      res.status(304).redirect("/login");
    }

    const queryString = `SELECT users.*, results.id AS result_id, results.*, quizzes.*, count(questions_answers.id) AS total
      FROM results
      JOIN quizzes ON quizzes.id = results.quiz_id
      JOIN questions_answers ON quizzes.id = questions_answers.quiz_id
      JOIN users ON results.user_id = users.id
      WHERE user_id = $1
      GROUP BY results.id, quizzes.id, users.id;`;
    const queryValues = [user_id];

    return db.query(queryString, queryValues).then((data) => {
      const quizzes = data.rows;
      console.log("---->", data.rows);
      // const total =
      const templateVars = { session: user_id, quizzes };
      /*    const queryString = `SELECT results.id as result_id, users.id, name, score, title, cover_image_url, category, finish_at as date_completed, quizzes.short_url, COUNT(questions_answers.id) as count
    FROM users
    JOIN results ON users.id = user_id
    JOIN quizzes on quizzes.id = quiz_id
    JOIN questions_answers on quizzes.id = questions_answers.quiz_id
    WHERE users.id = $1
    GROUP BY results.id, users.id, users.name, results.score, quizzes.title, quizzes.cover_image_url, quizzes.category, results.finish_at, quizzes.short_url;`;

    const queryValues = [session];

    return db.query(queryString, queryValues).then((data) => {
      const quizzes = data.rows;
      const templateVars = { session, quizzes }; */
      res.render("my-results", templateVars);
    });
  });

  return router;
};

module.exports = myResults;
