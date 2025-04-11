const express = require('express');
const router = express.Router();
const {Quizzes, Likes, Questions, Options, Scores, Users} = require("../models");
const {authenticateUser} = require("../middleware/AuthenticationFunction");
const bodyParser = require("body-parser");
const axios = require('axios');

// API to create a quiz, its questions, and its options
router.post("/", authenticateUser, async (req, res) => {

  try {
      
      const { title, question, questions } = req.body;

      const createQuiz = {title, question};

      // Uses the middleware to ensure proper authentication to make sure that the user cannot sent their own id to impersonate another user.
      createQuiz.UserId = req.person.id;

      
      // Record is created in the Quizzes table.
      const quiz = await Quizzes.create(createQuiz);




  // For every record added in the Questions table, use the quiz.id as a foreign key.
  for (const individualQuestion of questions) {
      
      const createdQuestion = await Questions.create({
        questionText: individualQuestion.questionText,
        QuizId: quiz.id
      });

      // For every record added in the Options table, use the createdQuestion.id as a foreign key.
      for (const individualOption of individualQuestion.options) {
        await Options.create({
          optionText: individualOption.optionText,
          answer: individualOption.answer,
          QuestionId: createdQuestion.id
        });
      }
    }


    return res.json("Quiz, questions, and options created successfully!");


  }
  catch (error)
  {
      return res.json("Error");
  }
});

// API to submit users' answers for each quiz and be scored.
router.post("/submit", authenticateUser, async (req, res) => {
  

  try {

    const { quizId, answers } = req.body;

  
  if (!quizId || !Array.isArray(answers) || answers.length === 0) {
    // Backend form validation to ensure that the number of options submitted by the user matches the number of questions stored in the database.
    return res.json({ error: "Invalid request!" });
  }


    // Get the quiz by quizId from the database in MySQL, get the associated questions, get the associated options (include the answer)
    const quiz = await Quizzes.findOne({
      where: { id: quizId },
      include: {
        model: Questions,
        include: {
          model: Options,
          attributes: ['id', 'optionText', 'answer'],
        },
      },
    });

    if (!quiz) {
      // If no quiz was found, then the error handling is to return.
      return res.json({ error: "Quiz not found" });
    }

    
    const questionIdsInQuiz = quiz.Questions.map((question) => question.id);
    const questionIdsInAnswers = answers.map((answer) => answer.questionId);

    // Backend form validation to ensure that no question is missing from the user's request.
    const missingQuestions = questionIdsInQuiz.filter((id) => !questionIdsInAnswers.includes(id));
    if (missingQuestions.length > 0) {
      return res.json({ error: "Invalid request!" });
    }

    // Backend form validation to ensure that no question is submtitted twice from the user's request.
    const duplicateQuestions = answers.filter((value, index, self) =>
      self.findIndex((t) => t.questionId === value.questionId) !== index
    );
    if (duplicateQuestions.length > 0) {
      return res.json({ error: "Invalid request!" });
    }

    // Initiating score. Represents the number of correct questions answered.
    let score = 0;

    // Iterating through each answer provided to compare to the option in the MySQL database.
    for (const answer of answers) {

      // Get the record in the Questions table equal to the answer.questionId
      const question = quiz.Questions.find((q) => q.id === answer.questionId);

      

      // Get the option in the Options table associated with the question and equal to answer.selectedOptionId
      const selectedOption = question.Options.find((o) => o.id === answer.selectedOptionId);

      

      // Increment the score by one question if the option found in the database was correct.
      if (selectedOption.answer) {
        score += 1;
      }
    }

    // Find the total amount of Questions records associated with the Quiz.

    const count = await Questions.count({
      where: {
        QuizId: quizId
      }
    });


    // Divide the total amount of correctly answered questions by the total amount of questions to determine the user's grade.
    const calculatedPercentage = Math.floor((score / count) * 100);

    // Create a record in Scores of the user's attempt including the quiz, user's id, and the calculated percentage (stored as an integer).
    const newScore = await Scores.create({
      QuizId: quizId,
      UserId: req.person.id,
      ScorePercentage: calculatedPercentage 
    });

    return res.json({ calculatedPercentage });
  } catch (error) {
    return res.json({ error: "Error submitting answers" });
  }
});

// API to return all quizzes and the user's likes for each quiz
router.get("/", authenticateUser, async (req, res) => {

  try {

    const allQuizzes = await Quizzes.findAll({include: [Likes]});

    // Uses the middleware to ensure proper authentication to make sure that only an authorized user can see their own likes.
    const likedQuizzes = await Likes.findAll({where: {UserId: req.person.id}})
    return res.json({allQuizzes: allQuizzes, likedQuizzes: likedQuizzes});

  }
  catch (error){
    return res.json({ errorMessage: "Invalid request!" });
  }
});

// API to get the quiz's information. Including title, the description, the questions, and options. Furthermore, supplementary data is provided through the 3rd party API from Pexels. Image infromation is provided for each quiz. The answers are omitted to prevent the user from seeing the answers on the frontend.
router.get("/withId/:id", authenticateUser, async (req, res) => {
    
  
  try {

    const quizId = req.params.id;

    // Get the quiz by quizId from the database in MySQL, get the associated questions, get the associated options (exclude the answer as it would compromise the integrity of the quiz)
    const quiz = await Quizzes.findOne({
      where: { id: quizId },
      include: {
        model: Questions,
        include: {
          model: Options,
          attributes: ['id', 'optionText'],
        },
      },
    });

    if (!quiz) {
      // If no quiz was found, then the error handling is to return.
      return res.json({ error: "Quiz was not found" });
    }


  // ***********
  // README - AFTER CLICKING THE EMAIL TO ACTIVATE YOUR API KEY, INPUT IT BELOW FOR pexelsApiKey
  const pexelsApiKey = 'InputYourAPIKeyHereREADME';
  // READ ME
  // ***********


  // An image will be searched by the title of the quiz.
  const searchQuery = quiz.title;


  /*

    // The response from Pexels for no images found under the searchQuery:
    {
  "page": 1,
  "per_page": 1,
  "photos": [],
  "total_results": 0
}


  */

  // A 3rd party API call is made to Pexels.com
  // The pexelsApiKey is added in the header. 200 requests are allowed an hour and 20,000 total per month.
  // The first image result on the first page is the response.
  let pexelsResponse = await axios.get('https://api.pexels.com/v1/search', {
    headers: {
      Authorization: pexelsApiKey,
    },
    params: {
      query: searchQuery,
      per_page: 1,
    },
  });

  // In case the title is gibberish and does not yield a single image, then I send another request to Pexels for a professional image.
  // This is the reason why pexelsResponse was initialized with let instead of const
  if (pexelsResponse.data.total_results == 0)
  {
    pexelsResponse = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: pexelsApiKey,
      },
      params: {
        query: "office",
        per_page: 1,
      },
    });
  }

  // The link to the image is included in the response from Pexels.

  // To follow the guidelines of using the 3rd party API, we do have to include and send the photographer and Pexels link back to the frontend along with the image link.
  const image = pexelsResponse.data.photos[0];
  const imageData = {
    imageUrl: image.src.original,
    photographer: image.photographer,
    photographerUrl: image.photographer_url,
  };

    // Format json to include only the ID's and text fields. The createdAt and updatedAt fields are excluded.
    const formattedQuestions = quiz.Questions.map((question) => {
      const options = question.Options.map((option) => ({
        id: option.id,
        optionText: option.optionText,
      }));

      return {
        id: question.id,
        questionText: question.questionText,
        options: options,
      };
    });

    
    return res.json({
      id: quiz.id,
      title: quiz.title,
      question: quiz.question,
      questions: formattedQuestions,
      image: imageData,
    });
  } catch (error) {
    return res.json({ error: "Invalid request!" });
  }
});

// API to get the user's name associated with a quiz's id
router.get("/creator/:id", authenticateUser, async (req, res) => {

  try {
    const quizId = req.params.id;

    const quiz = await Quizzes.findOne({ where: { id: quizId } });

    if (!quiz) {
        // If no quiz was found, the error handling is to just send an empty string.
        return res.json({ creatorName: "" });
    }

    const creatorId = quiz.UserId;

    
    const creatorName = await Users.findOne({ where: { id: creatorId }, attributes: ['user'] });

    // Only send the user, which is the username.
    return res.json({ creatorName: creatorName.user });

  }
  catch (error){
    return res.json({ creatorName: "" });
  }
});

// API to only get the quizzes created by a specified user's id.
router.get("/withUserId/:id", authenticateUser, async (req, res) => {

  try {
    const id = req.params.id;
    const allQuizzes = await Quizzes.findAll({where: {UserId: id}, include: [Likes]});
    return res.json(allQuizzes);

  }
  catch (error){
    return res.json({errorMessage: "Invalid request!"});
  }
});

// API to only get the questions and correct answers of a given quiz's id.
  router.get("/answers/:id", authenticateUser, async (req, res) => {
    try {
      const quizId = req.params.id;
      
      // Get the quiz by quizId from the database in MySQL, get the associated questions, get the associated options (include the answer)
      const quiz = await Quizzes.findOne({
        where: { id: quizId },
        include: {
          model: Questions,
          include: {
            model: Options,
            attributes: ['id', 'optionText', 'answer'], 
          },
        },
      });
  
      if (!quiz) {
        // If no quiz was found, then the error handling is to return.
        return res.json({ error: "Quiz was not found" });
      }
  
      // Format json to include only the answers that are true.
      const formattedQuestions = quiz.Questions.map((question) => {

        const trueOption = question.Options.find(option => option.answer);
  
        return {
          id: question.id,
          questionText: question.questionText,
          options: trueOption ? [
            {
              id: trueOption.id,
              optionText: trueOption.optionText,
            }
          ] : []
        };
      });
  
      
      return res.json({
        id: quiz.id,
        title: quiz.title,
        question: quiz.question,
        questions: formattedQuestions,
      });
    } catch (error) {
      return res.json({ error: "Invalid request!" });
    }
  });

// API to delete a quiz by a given quiz's id.
router.delete("/:quizId", authenticateUser, async(req, res) => {

  try {
    const quizId = req.params.quizId;

    // Uses the middleware to ensure proper authentication to make sure that the user cannot sent their own id to impersonate another user.
    const UserId = req.person.id;

    const quiz = await Quizzes.findOne({ where: { id: quizId } });

    

    if (quiz.UserId !== UserId) {
      // Ensure the user is authorized to delete the comment by using the authentication middleware and compare the user's id with the comment's UserId field
      return res.json("Not authorized!");
    }

    // Quiz is deleted from the MySQL database.
    await Quizzes.destroy(
        {
            where: {id: quizId}
        }
    )


    // No need to worry about deleting the questions, options, comments, likes, and scores as those are cascaded deleted.
    return res.json("Deleted!"); 
  }
  catch (error){
      return res.json("error");
  }
})


module.exports = router;