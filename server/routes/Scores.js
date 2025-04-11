const express = require('express');
const router = express.Router();
const {Scores} = require("../models");
const {authenticateUser} = require("../middleware/AuthenticationFunction");
const { sequelize } = require("../models");

// API to return a specific quiz's score information.
router.get("/withQuizId/:id", authenticateUser, async (req, res) => {
    try {
        const quizId = req.params.id;

        // Gets the total number of Scores records associated with the quiz. Indicates the amount of attempts by all users.
        const count = await Scores.count({
            where: {
                QuizId: quizId
            }
        });

        // Finds the average of all the Scores records' ScorePercentage associated with the quiz.
        const averageScore = await Scores.findAll({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('ScorePercentage')), 'averageScore']
            ],
            where: {
                QuizId: quizId
            }
        });

        const average = averageScore[0].get('averageScore');

        return res.json({
            count,
            averageScore: average
        });
    } catch (error) {
        return res.json({ message: "Invalid request!" });
    }
});

// API to return a specific quiz's score information for the user logged in.
router.get("/withQuizId/:qid/withUserId/:uid", authenticateUser, async (req, res) => {
    try {
        const { qid, uid } = req.params;

        // Uses the middleware to ensure proper authentication to make sure that the user cannot sent their own id to find confidential information about another user.
        const usernameIdentification = req.person.id;

        
        // Ensure the user is authorized to view the scores by using the authentication middleware and compare the user's id with the scores's UserId field.
        if (usernameIdentification !== (parseInt(uid, 10))) {
            return res.json("Not authorized!");
        }

        // Gets the total number of Scores records associated with the quiz with the UserId equal to uid. Indicates the amount of attempts by all users.
        const count = await Scores.count({
            where: {
                QuizId: qid,
                UserId: uid
            }
        });

        // Finds the average of all the Scores records' ScorePercentage associated with the given QuizId and UserId.
        const averageScore = await Scores.findAll({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('ScorePercentage')), 'averageScore']
            ],
            where: {
                QuizId: qid,
                UserId: uid
            }
        });

        const average = averageScore[0].get('averageScore');

        // Finds the largest value of all the Scores records' ScorePercentage associated with the given QuizId and UserId. Indicates the highest ScorePercentage of the user.
        const maxScore = await Scores.findOne({
            attributes: [
                [sequelize.fn('MAX', sequelize.col('ScorePercentage')), 'maxScore']
            ],
            where: {
                QuizId: qid,
                UserId: uid
            }
        });

        const max = maxScore.get('maxScore');

        // Finds the first record of all the Scores records associated with the given QuizId and UserId with the most recent createdAt date being listed first. Indicates the score the user just got on the quiz.
        const mostRecent = await Scores.findOne({
            attributes: ['ScorePercentage'],
            where: {
                QuizId: qid,
                UserId: uid
            },
            order: [['createdAt', 'DESC']]
        });

        const mostRecentScore = mostRecent ? mostRecent.get('ScorePercentage') : null;

        return res.json({
            count,
            averageScore: average,
            maxScore: max,
            mostRecentScore
        });
    } catch (error) {
        return res.json({ message: "Invalid request!" });
    }
});

module.exports = router;