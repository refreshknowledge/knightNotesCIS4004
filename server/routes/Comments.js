const express = require('express');
const router = express.Router();
const {Comments} = require("../models");
const {authenticateUser} = require("../middleware/AuthenticationFunction")

// API to create a comment
router.post("/", authenticateUser, async (req, res) => {

    try {
    
    // body text and specific quiz given
    const { commentText, QuizId } = req.body;

    // Uses the middleware to ensure proper authentication with the accessToken rather than having the user tell the server who they are.
    const UserId = req.person.id;
    const user = req.person.user;


    // Backend form validation in case frontend was manipulated with
    if (commentText.length < 1 || commentText.length > 250) {
        return res.json({ errorMessage: "Comment text must be between 1 and 250 characters." });
    }

    const newCommentData = {
        commentText,
        UserId,
        QuizId,
        user,
    };

    

    const newComment = await Comments.create(newCommentData);
    return res.json(newComment);

}
catch (error){
    return res.json({ errorMessage: "Invalid request!" });
}
});

// API to return all comments associated to the quiz's id
router.get("/:quizId", authenticateUser, async (req, res) => {

    try{

    const quizId = req.params.quizId;
    const comments = await Comments.findAll({ where: {QuizId: quizId}});
    return res.json(comments);
}
catch (error){
    return res.json({ errorMessage: "Invalid request!" });
}
});


// API to delete a comment with a given comment id
router.delete("/:commentId", authenticateUser, async (req, res) => {

    try {
    const commentId = req.params.commentId;

    // Uses the middleware to ensure proper authentication with the accessToken rather than having the user tell the server who they are.
    const UserId = req.person.id;

    const comment = await Comments.findOne({ where: { id: commentId } });

    
    // Ensure the user is authorized to delete the comment by using the authentication middleware and compare the user's id with the comment's UserId field
    if (comment.UserId !== UserId) {
        return res.json({ errorMessage: "Not authorized!" });
    }

    // Comment is deleted from the MySQL database.
    await Comments.destroy({where: {id: commentId}});

    return res.json("Deleted!");

}
catch (error){
    return res.json({ errorMessage: "Invalid request!" });
}
})



module.exports = router;