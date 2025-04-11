import React, {useEffect, useState, useContext} from "react";
import {useParams, useNavigate} from "react-router-dom";
import axios from "axios";
import {AuthenticateContext} from "../AuthenticateContext";
import '../Quiz.css';

function Quiz(){


  

    const { authenticateState } = useContext(AuthenticateContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {

    
            if (!localStorage.getItem("accessToken"))
                {
                  navigate("/login");
                }
                else{

    
    // Response will display the specified quiz's info, associated questions, and associated options. Furthermore, the 3rd party supplementary images are within the response. Finally, to note, the answers are omitted in the response.
    const fetchQuizData = async () => {
      
  
      try {
          const response = await axios.get(`http://localhost:3001/quizzes/withId/${id}`, {
              headers: {
                  accessToken: localStorage.getItem("accessToken"),
              },
          }).catch((error) => {
            navigate("/");
          });
  
          if (response.data.error) {
              navigate("/");
          } else {
              setQuiz(response.data);
          }
      } catch (error) {
          navigate("/");
      }
  };

    fetchQuizData();

}
  }, [authenticateState]);

  
  const handleOptionChange = (questionId, optionId) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== quiz.questions.length) {
      alert('You must answer all of the questions before you can submit.');
      return;
    }
  
    try {
      const answers = Object.keys(selectedAnswers).map((questionId) => ({
        questionId: parseInt(questionId), // Ensure questionId is an integer
        selectedOptionId: parseInt(selectedAnswers[questionId]), // Ensure selectedOptionId is an integer
      }));
  
      const response = await axios.post(
        'http://localhost:3001/quizzes/submit',
        { quizId: parseInt(id), answers },  // Ensure quizId is an integer
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),  // Include the token from localStorage in headers
          },
        }
      );
      
      navigate(`/quiz/${id}/info`);
    } catch (err) {
      alert('Failed to submit answers');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!quiz) {
    return <div>Loading quiz...</div>;
  }



  return (
    <div>
      <h1 className="quizPageTitle">{quiz.title}</h1>
      {/* Response from the fetchQuizData function requesting from Knight Notes backend  */}
      {/* The backend had made a 3rd part API call to Pexels.com to retrieve the image links and photographer links. The supporting links are compliant with the Pexels API guideline usage. */}
      <div className="imageContainer">{quiz.image && (
        <div>
          
          <img src={quiz.image.imageUrl} alt={quiz.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
          <p>
            Photo by <a href={quiz.image.photographerUrl} target="_blank" rel="noopener noreferrer">{quiz.image.photographer}</a> on <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>
          </p>
        </div>
      )}</div>
      <p className="quizDescription">{quiz.question}</p>


      <div className="questionQuizContainer">
      {quiz.questions.map((question) => (
        <div key={question.id} className="question">
          <h3>{question.questionText}</h3>
          {question.options.map((option) => (
            <div key={option.id}>
              <label>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedAnswers[question.id] === option.id}
                  onChange={() => handleOptionChange(question.id, option.id)}
                />
                {option.optionText}
              </label>
            </div>
          ))}
        </div>
      ))}</div>

<div className="submitQuizButtonContainer">
      <button className="submitQuizButton" onClick={handleSubmit}>Submit</button>
      </div>

      
    </div>
  );



}

export default Quiz;