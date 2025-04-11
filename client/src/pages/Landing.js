import React, {useContext} from 'react'
import axios from "axios";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {AuthenticateContext} from "../AuthenticateContext";
import '../Landing.css';

function Landing() {



    const[allQuizzes, setAllQuizzes] = useState([]);
    const[likedQuizzes, setLikedQuizzes] = useState([]);
    const {authenticateState} = useContext(AuthenticateContext);
    let navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {

        if (!localStorage.getItem("accessToken"))
            {
              navigate("/login");
            }
            else{

            

        // Response is an array of quiz records along with an array of the user's like records.
        axios.get("http://localhost:3001/quizzes", {headers: {accessToken: localStorage.getItem("accessToken")}}).then((response) => {

            if(response.data.errorMessage)
                {
                    return(<div>Invalid request!</div>);
                }
                else{
            setAllQuizzes(response.data.allQuizzes);
            setLikedQuizzes(response.data.likedQuizzes.map((like) => {
                return like.QuizId;
            }));
        }}).catch((error) => {
      
            navigate("/");
          });
    }
    }, [authenticateState]);

    

  // Response will either send the user to the searcheduser page with the creators' quzzes or error handle.
  const searchForTheNameButton = () => {
    axios.get(`http://localhost:3001/users/findIdByUsername/${inputValue}`, {
        headers: { accessToken: localStorage.getItem("accessToken") }
    })
    .then((response) => {
        
        if (response.data !== "error") {
            navigate(`/searcheduser/${response.data.id}`);
        } else {
            alert("No user found");
        }
    })
    .catch((error) => {
        alert("Error");
        navigate("/");
    });
};
  
    // Request will both update the database and the likedQuizzes array on the frontend.
    const likeQuiz = (quizId) => {
        axios.post("http://localhost:3001/likes", 
            {QuizId: quizId}, 
            {headers: {accessToken: localStorage.getItem("accessToken")}}
        ).then((response) => 
            {

                if (response.data.errorMessage) {
                    alert(response.data.errorMessage);
                } else {
                
            setAllQuizzes(allQuizzes.map((quiz) => 
                {
                if(quiz.id === quizId)
                {
                    if(response.data.liked)
                    {
                        // Add 1 to the like count for the quiz
                    return {...quiz, Likes: [...quiz.Likes, 0]}
                    }
                    else
                    {
                        // Remove 1 to the like count for the quiz
                        const arrayOfLikes = quiz.Likes;
                        arrayOfLikes.pop()
                        return {...quiz, Likes: arrayOfLikes}
                    }
                }
                else
                {
                    return quiz;
                }
            })
            )
        
            if (likedQuizzes.includes(quizId))
            {
                setLikedQuizzes(likedQuizzes.filter((id) => {
                    return id != quizId;
                }))
            }
            else
            {
                setLikedQuizzes([...likedQuizzes, quizId])
            }
        }}).catch((error) => {
      
            navigate("/");
            window.location.reload(true);
          });
        
    }

    return (
        <div>

{/* Calls the searchForTheNameButton function to search for the given user inputted in the text field.  */}
<div className="searchContainer">
            <div className="searchByNameLabel">Search for quizzes by your favorite creators!</div>

<div>
      <input
        type="text"
        value={inputValue}
        className="searchByNameField"
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button className="searchByNameButton" onClick={searchForTheNameButton}>Submit</button>
    </div>
    </div>


<div className="quizzesPageTitleContainer">
    <div className="quizzesPageTitle">Quizzes</div>
    <div className = "quizzesGroupOfHeadings">
    <div className="quizzesPageHeading">Click "Begin quiz!" to start answering the questions for that given quiz.</div>
    <div className="quizzesPageHeading">Click "View quiz info!" to review the answers and comments of the quiz.</div>
    <div className="quizzesPageHeading">Pick the quizzes that interest you, or create one by navigating to "Create a Quiz" at the top of the screen!</div>
    <div className="quizzesPageHeading">We recommend you to start taking the quizzes with a few likes.</div>
    </div>
    </div>


{/* Displays the list of all the quizzes and its data/associated data. Allows the user to like and dislike.  */}

<div className="quizzesOnLandingPageContainer">
        {allQuizzes.map((value, key) => {

            return (

            <div key={key} className="quiz"> 
            <div className="landingPageQuizTextContainer">
                <div className="title"> {value.title} </div>
                <div className="question"> {value.question} </div>
                </div>
                
                <div className="landingPageQuizButtonContainer">
                <button className="beginQuizButton" onClick={() => {navigate(`/quiz/${value.id}`)}}>
                Begin quiz!
                </button>

                <button className="viewQuizInfoButton" onClick={() => {navigate(`/quiz/${value.id}/info`)}}>
                View quiz info!
                </button>
                </div>

                <div className="likeButtonContainer">
                <button className="likeButton" onClick={() => {likeQuiz(value.id)}}>
                {likedQuizzes.includes(value.id) ? 'Dislike' : 'Like'}
                </button>
                


                
                
                <div className="likeSomethingCount"><button className="likeButton">{value.Likes.length}</button></div>
                
                </div>
            </div>
            );

        })}
        </div>
        </div>
    )

    
}

export default Landing