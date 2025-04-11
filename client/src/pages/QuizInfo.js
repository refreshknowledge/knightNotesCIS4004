import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthenticateContext } from "../AuthenticateContext";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../QuizInfo.css';

function QuizInfo() {
    let { id } = useParams();

    const [quizObject, setQuizObject] = useState({});
    const [comments, setComments] = useState([]);
    const [userCreatorName, setUserCreatorName] = useState("");
    const [quizStats, setQuizStats] = useState({ count: 0, averageScore: 0 });
    const [userStats, setUserStats] = useState({
        count: 0,
        averageScore: 0,
        maxScore: 0,
        mostRecentScore: null,
    });
    const [quizAnswers, setQuizAnswers] = useState([]);
    const { authenticateState } = useContext(AuthenticateContext);
    let navigate = useNavigate();

    useEffect(() => {

        if (!localStorage.getItem("accessToken"))
            {
              navigate("/login");
            }
            else{
        if (!authenticateState.id)
            {
                return;
            }

        // Response will display the specified quiz's info, associated questions, and associated options. Furthermore, the 3rd party supplementary images are within the response.
        axios.get(`http://localhost:3001/quizzes/withId/${id}`, {
            headers: {
                accessToken: localStorage.getItem("accessToken"),
            },
        })
        .then((response) => {
            if (response.data === "error") {
                navigate("/");
            } else {
                setQuizObject(response.data);
            }
        })
        .catch((error) => {
            navigate("/");
        });
        

    

        // Response will display the options that are accurate for each question within the quiz.
        axios.get(`http://localhost:3001/quizzes/answers/${id}`, {
            headers: {
                accessToken: localStorage.getItem("accessToken"),
            },
        }).then((response) => {
            

            
            if (response.data && Array.isArray(response.data.questions)) {
                setQuizAnswers(response.data.questions);
            } else {
                setQuizAnswers([]);
            }
        }).catch((error) => {
            alert("Error");
        });

        // Response is an array of comments associated with the quiz's id.
        axios.get(`http://localhost:3001/comments/${id}`, {
            headers: {
                accessToken: localStorage.getItem("accessToken"),
            },
        }).then((response) => {
            if (Array.isArray(response.data)) {
                setComments(response.data);
            } else {
                setComments([]);
            }
        });

        // The response includes the name of the creator of the quiz.
        axios.get(`http://localhost:3001/quizzes/creator/${id}`, { headers: {
            accessToken: localStorage.getItem("accessToken"),
        }}).then((response) => {
            setUserCreatorName(response.data.creatorName);
        });

        // The response includes the quiz's stats from all of the records in Scores.
        axios.get(`http://localhost:3001/scores/withQuizId/${id}`, {
            headers: { accessToken: localStorage.getItem("accessToken") }
        }).then((response) => {
            setQuizStats({
                count: response.data.count,
                averageScore: response.data.averageScore
            });
        });

        // The response includes the quiz's stats from all the records in Scores where the user's id is equal to the Scores' UserId.
        axios.get(`http://localhost:3001/scores/withQuizId/${id}/withUserId/${authenticateState.id}`, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            }).then((response) => {
                setUserStats({
                    count: response.data.count,
                    averageScore: response.data.averageScore,
                    maxScore: response.data.maxScore,
                    mostRecentScore: response.data.mostRecentScore
                });
            });
        }

    }, [authenticateState]);

    // Request to delete a specified quiz and to navigate back to the landing page.
    const deleteQuiz = (id) => {
        axios.delete(`http://localhost:3001/quizzes/${id}`, { headers: { accessToken: localStorage.getItem("accessToken") } }).then(() => {
            navigate("/");
        });
    };
    
    // Request to delete a specified comment and removes the comment from the comments array on the frontend.
    const deleteComment = (id) => {
        axios.delete(`http://localhost:3001/comments/${id}`, {
            headers: { accessToken: localStorage.getItem("accessToken") }
        }).then((response) => {
            if (response.data.errorMessage) {
                alert("Error occurred when attempting to delete comment.")
            } else {
            setComments(comments.filter((val) => val.id !== id));
        }
        });
    };


    return (
        <div className="quizPage">
            <div className="topPart">
                <div className="quiz">
                    <div className="title"> {quizObject && <div>{quizObject.title}</div>} </div>
                    <div className="question"> {quizObject && <div>{quizObject.question}</div>} </div>
                    <div className="user"> Created by {userCreatorName && <div>{userCreatorName}</div>} </div>

                    
                    
                    <div>{authenticateState.user === userCreatorName && (
                        <button className="deleteQuizButton" onClick={() => { deleteQuiz(quizObject.id) }}> Delete Quiz</button>
                    )}</div>
                </div>

                <div className="statsInformation">


                <div className="quizStats">
                        <div className="quizStatsTAA">Total attempts by all students: </div><div className="quizStatsTACount">{quizStats.count}</div>
                        <div className="quizStatsASA">Average score across all students: </div><div className="quizStatsASACount">{quizStats.averageScore}%</div>
                    </div>

                    
                    
                    <div>{authenticateState.user && (
                        <div className="userStats">
                            <div className="userStatsYNA">Your number of attempts: </div><div className="userStatsYNACount">{userStats.count}</div>
                            <div className="userStatsYAS">Your average score: </div><div className="userStatsYASCount">{userStats.averageScore}%</div>
                            <div className="userStatsH">Your highest score: </div><div className="userStatsHCount">{userStats.maxScore}%</div>
                            <div className="userStatsR">Your most recent score: </div><div className="userStatsRCount">{userStats.mostRecentScore}%</div>
                        </div>
                    )}</div>


                </div>


{/* The backend had made a 3rd part API call to Pexels.com to retrieve the image links and photographer links. The supporting links are compliant with the Pexels API guideline usage. */}
                <div className="imageContainer">{quizObject.image && (
        <div>
          
          <img src={quizObject.image.imageUrl} alt={quizObject.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
          <p>
            Photo by <a href={quizObject.image.photographerUrl} target="_blank" rel="noopener noreferrer">{quizObject.image.photographer}</a> on <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>
          </p>
        </div>
      )}</div>


            

<div className="quizAnswerKey">{quizAnswers && quizAnswers.length > 0 && (
                        <div className="questions">
                            {quizAnswers.map((question, idx) => (
                                <div key={idx} className="question-item">
                                    <div className="questionKeyText">
                                    <div className="questionKeyTextLabel">Question: </div>
                                    <div className="questionKeyTextText">{question.questionText}</div>
                                    </div>
                                    
                                    <div className="optionKeyLabel">{question.options && question.options.length > 0 && (
                                        <div className="correct-option">
                                            <div className="optionKeyLabelAnswer">Answer: </div>
                                            <div className="optionKeyLabelAnswerText">{question.options[0].optionText}</div> 
                                        </div>
                                    )}</div>
                                </div>
                            ))}
                        </div>
                    )}</div>
            </div>

            <div className="divider"></div>

            <div className="bottomPart">

                <div>Comments</div>
                <div>Comments must have 1 to 250 characters inclusively.</div>
                
                <Formik
    initialValues={{ commentText: "" }}
    validationSchema={Yup.object().shape({
        commentText: Yup.string()
            .min(1, "Comment must be at least 1 character.")
            .max(250, "Comment cannot exceed 250 characters.")
            .required("Comment is required"),
    })}
    onSubmit={(data, { resetForm }) => {
        axios.post("http://localhost:3001/comments", {
            commentText: data.commentText,
            QuizId: id,
        }, {
            headers: { accessToken: localStorage.getItem("accessToken") },
        }).then((response) => {
            if (response.data.errorMessage) {
                alert(response.data.errorMessage);
            } else {
                const commentToBeAdded = {
                    commentText: data.commentText,
                    user: response.data.user,
                    id: response.data.id,
                    UserId: response.data.UserId,
                    createdAt: new Intl.DateTimeFormat('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true
                    }).format(new Date())
                };
                setComments([...comments, commentToBeAdded]);
                resetForm(); // Clear the input
            }
        });
    }}
>
    <Form className="addComment">
        <label htmlFor="commentText"></label>
        <ErrorMessage name="commentText" component="span" />
        <Field
            id="inputCredentials"
            name="commentText"
            placeholder="Write a comment..."
            type="text"
        />
        <button type="submit" className="commentAddButton">Add Comment</button>
    </Form>
</Formik>
                
                

                <div className="allComments">
                    {Array.isArray(comments) && comments.map((value, key) => {
                        return (
                            <div key={key} className="comment">
                                <div className="commentCommentText">{value.commentText}</div>
                                <label className="commentCommentUser"> {value.user}</label>
                                <label className="commentCommentDate"> {new Date(value.createdAt).toLocaleString()}</label>
                                {authenticateState.user === value.user && <button className="commentRemoveButton" onClick={() => { deleteComment(value.id) }}> Remove </button>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default QuizInfo;
