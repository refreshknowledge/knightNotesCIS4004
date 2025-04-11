import './App.css';
import {BrowserRouter as Router, Route, Routes, Link} from "react-router-dom";
import Landing from "./pages/Landing";
import CreateQuiz from "./pages/CreateQuiz";
import Quiz from "./pages/Quiz";
import QuizInfo from "./pages/QuizInfo";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PageNotFound from "./pages/PageNotFound";
import SearchedUser from "./pages/SearchedUser";
import {AuthenticateContext} from "./AuthenticateContext";
import { useState, useEffect } from "react";
import axios from "axios";

function App() {

  
  // Initiating
  const[authenticateState, setAuthenticateState] = useState({user: "", id: 0, status: false});
  const [error, setError] = useState(false);

  // Request made to backend to ensure user is logged in
  useEffect(() => {
    axios.get("http://localhost:3001/users/authenticate", {headers: {accessToken: localStorage.getItem("accessToken")}}).then((response) => {
      if (response.data.error)
      {
        setAuthenticateState({...authenticateState, status: false});
      }
      else
      {
        setAuthenticateState({user: response.data.user, id: response.data.id, status: true});
      }
    }).catch((error) => {
      setError(true);
      
    });
  }, [])

  

  return (
    <div className="App">
      {/* Banner would show when server is down. */}
      {error && <div className="serverNotRunning">Please refresh the page once the server is running to allow the website to function.</div>}
      <AuthenticateContext.Provider value ={{authenticateState, setAuthenticateState}}>
      <Router>
        <div className="navigationBar">
          
        <div className="farLeftNav"> 
        <Link className="logoLink" to="/">
  
  <img 
  src={process.env.PUBLIC_URL + "/PNGofKnightNotes.png"} 
  alt="Logo" 
  className="logoImage" 
/>
</Link>
      <br></br>
      <Link className="knightNotesLink" to="/">Knight Notes</Link>
      <br></br>
      </div>
      
      {/* If user is not logged in, they get the login and sign up links, else then they are presented the landing and create a quiz links */}
      {!authenticateState.status ? (
        <>
        <div className="middleNav"> 
      <Link className="loginLink" to="/login">Login</Link>
      <br></br>
      <Link className="signupLink" to="/signup">Sign up</Link>
      </div>
      </>
      ) : (
        <>
        <div className="leftNav"> 
          {/* If an error occurs, the server banner displays */}
      <Link className="landingPageLink" to="/" onClick={() => {axios.get("http://localhost:3001/users/authenticate", { headers: { accessToken: localStorage.getItem("accessToken") } })
      .then((response) => {
        if (response.data.error) {
          setAuthenticateState({ ...authenticateState, status: false });
        } else {
          setAuthenticateState({ user: response.data.user, id: response.data.id, status: true });
          setError(false);
        }
      })
      .catch((error) => {
        setError(true);
      });}}>Landing Page</Link>
      <br></br>
      <Link className="createQuizLink" to="/createquiz" onClick={() => {axios.get("http://localhost:3001/users/authenticate", { headers: { accessToken: localStorage.getItem("accessToken") } })
      .then((response) => {
        if (response.data.error) {
          setAuthenticateState({ ...authenticateState, status: false });
        } else {
          setAuthenticateState({ user: response.data.user, id: response.data.id, status: true });
          setError(false);
        }
      })
      .catch((error) => {
        setError(true);
      });}}>Create a Quiz</Link>
      <br></br>
      </div>

      

      <div className="rightNav"> 
      {/* accessToken removed to log out */}
      <button className="logoutButton" onClick={() => {
      localStorage.removeItem("accessToken");
      setAuthenticateState({user: "", id: 0, status: false});
  }}>Logout</button> </div>
      </>
    )
      }
      <div className="farRightNav"> 
      <h1 className="loggedInUsername">Welcome {authenticateState.user}</h1></div>
      </div>
      {/* Other pages on Knight Notes are accessible through these relative links */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/createquiz" element={<CreateQuiz />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/quiz/:id/info" element={<QuizInfo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/searcheduser/:id" element={<SearchedUser />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      </Router>
      </AuthenticateContext.Provider>
    </div>
  );
  
}

export default App;
