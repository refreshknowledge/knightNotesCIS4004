const express = require('express');
const router = express.Router();
const {Likes} = require("../models");
const {authenticateUser} = require("../middleware/AuthenticationFunction");


// API to like a quiz or to remove a like from a quiz
router.post("/", authenticateUser, async(req, res) => {
    try{
    const { QuizId } = req.body;

    // Uses the middleware to ensure proper authentication with the accessToken rather than having the user tell the server who they are.
    const UserId = req.person.id;


    // Sees if a record is already created, if so get the record showing the user has liked the quiz.
    const likeRecord = await Likes.findOne({where: {QuizId: QuizId, UserId: UserId}});

    if (likeRecord)
    {
        // If the user had liked the quiz, then the record is deleted.
        await Likes.destroy({where: {QuizId: QuizId, UserId: UserId}});
        return res.json({liked: false});
    }
    else{
        
        // If the user had not liked the quiz, then a record is created.
        await Likes.create({QuizId: QuizId, UserId: UserId});

    return res.json({liked: true});
    }
}
catch (error){
    return res.json({ errorMessage: "Invalid request!" });
}
})

module.exports = router;