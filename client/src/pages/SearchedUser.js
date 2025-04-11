import React, { useEffect, useState, useContext } from "react";
import {useParams, useNavigate} from "react-router-dom";
import axios from "axios";
import {AuthenticateContext} from "../AuthenticateContext";
import '../SearchedUser.css';

function SearchedUser()
{

  

    let {id} = useParams();
    let navigate = useNavigate();
    const [user, setUser] = useState("");
    const [allQuizzes, setAllQuizzes] = useState([]);
    const { authenticateState } = useContext(AuthenticateContext);

    useEffect(() => {

        if (!localStorage.getItem("accessToken"))
            {
              navigate("/login");
            }
            else{
        // Response will display the specified Users record. Specifically the user's user (name).
        axios.get(`http://localhost:3001/users/bio/${id}`, {
            headers: {
              accessToken: localStorage.getItem("accessToken"),
            },
          }).then((response) => {

            if(response.data.errorMessage)
                {
                    navigate("/");
                }
                else{
            
            setUser(response.data.user);
                }
        }).catch((error) => {
            
            navigate("/");
          });
    
        // Response will display the specified user's quizzes associate to the UserId.
        axios.get(`http://localhost:3001/quizzes/withUserId/${id}`, {
            headers: {
              accessToken: localStorage.getItem("accessToken"),
            },
          }).then((response) => {
            
            if(response.data.errorMessage)
                {
                    navigate("/");
                }
                else{
            if (Array.isArray(response.data)) {
                setAllQuizzes(response.data);
            } else {
                alert("Error");
            }
        }
        }).catch((error) => {
            navigate("/");
          });
    }
    }, [authenticateState]);

    return (
    
    
        
    
    <div>

<div className="bio">
                Searched username: {user ? <div>{user}</div> : <div>Loading...</div>} 
            </div>

            <div className="quizzesOnSearchedUserPageContainer">
        {Array.isArray(allQuizzes) && allQuizzes.length > 0 ? (
            allQuizzes.map((value, key) => (
                <div key={key} className="quiz"> 
                    <div className="title"> {value.title} </div>
                    <div className="question"> {value.question} </div>
                    
                    <button className="beginQuizButton" onClick={() => {navigate(`/quiz/${value.id}`)}}>
                        Begin quiz!
                    </button>
    
                    <button className="viewQuizInfoButton" onClick={() => {navigate(`/quiz/${value.id}/info`)}}>
                        View quiz info!
                    </button>
                </div>
            ))
        ) : (
            <p className="noQuizzes">No quizzes available.</p>
        )} </div>
    </div>)




}

export default SearchedUser;