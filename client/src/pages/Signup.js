import React, {useState, useContext} from "react";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {AuthenticateContext} from "../AuthenticateContext";
import '../Signup.css';

function Signup() {
    let navigate = useNavigate();
    const {setAuthenticateState} = useContext(AuthenticateContext);
    

    const initialValues = {
            user: "",
            password: "",
        };
        
    
        const validationSchema = Yup.object().shape({
            user: Yup.string().min(4).max(20).required(),
            password: Yup.string().min(5).max(20).required(),
        });

    const onSubmit = (data) => {
        axios.post("http://localhost:3001/users", data).then((response) => {
            

            if (response.data.signUpAnswer === "Success!") {
                

                axios.post("http://localhost:3001/users/login", data).then((response2) => {
                    
                        localStorage.setItem("accessToken", response2.data.token);
                        setAuthenticateState({user: response2.data.user, id: response2.data.id, status: true});
                        navigate("/");
                    
                })


            } else {
                
                alert(response.data.signUpAnswer);
            }
        }).catch((error) => {
      
            window.location.reload(true);
          });
    };

    return (<div>

        <div className="signupPageTitle">Signup to get started!</div>

<div className="signupPageBriefIntroTitle">
        <div className="signupInfo">Welcome to Knight Notes!</div>
                                                <div className="signupInfo">You can create and take quizzes.</div>
                                                <div className="signupInfo">Our goal is to let students have a resource to create their own study material to succeed in their classes.</div>
                                                </div>
                                                <div className="signupPageRulesContainer">
        <div className="signupPageRules">Account creation rules:

            <ol>
                <li className="signupPageRulesInfo">Username must be between 4 and 20 characters inclusively.</li>
                <li className="signupPageRulesInfo">Password must be between 5 and 20 characters inclusively.</li>
                <li className="signupPageRulesInfo">Username must be unique.</li>
                <li className="signupPageRulesInfo">Username and password can only include letters, numbers, and underscores.</li>
            </ol>
        </div>
        </div>

        <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                    <Form className="formContainer">
                        
                        <label>User:</label>
                        <ErrorMessage name="user" component="span"/>
                        <Field id="inputCredentials" name="user" placeholder=""></Field>

                        <label>Password:</label>
                        <ErrorMessage name="password" component="span"/>
                        <Field id="inputCredentials" type="password" name="password" placeholder=""></Field>
        
                        <button type="submit">Sign up!</button>
                    </Form>
                </Formik>

                                                
    </div>);

    
}

export default Signup;