import React, {useState, useContext} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {AuthenticateContext} from "../AuthenticateContext";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import '../Login.css';

function Login() {

    


    const {setAuthenticateState} = useContext(AuthenticateContext);

    let navigate = useNavigate();

    const initialValues = {
        user: "",
        password: "",
    };

    // Frontend validation to ensure the request will be accepted.
    const validationSchema = Yup.object().shape({
                user: Yup.string().min(4).max(20).required(),
                password: Yup.string().min(5).max(20).required(),
            });

    

    return (
    <div>

        <div className="loginPageTitle">Login to continue!</div>

        <div className="loginInfo">Welcome to Knight Notes! You can create and take quizzes. Our goal is to let students have a resource to create their own study material to succeed in their classes.</div>
                                            
        


        <Formik initialValues={initialValues} onSubmit={(data) => {

        // Perform the login screen's function:
        axios.post("http://localhost:3001/users/login", data).then((response) => {
            if (response.data.error)
            {
                alert(response.data.error);
            }
            else
            {
                localStorage.setItem("accessToken", response.data.token);
                setAuthenticateState({user: response.data.user, id: response.data.id, status: true});
                navigate("/");
            }
            
        }).catch((error) => {
      
            window.location.reload(true);
          });
    }} validationSchema={validationSchema}>
                            <Form className="formContainer">

                <label>User:</label>
                                        <ErrorMessage name="user" component="span"/>
                                        <Field id="inputCredentials" name="user" placeholder=""></Field>
                
                                        <label>Password:</label>
                                        <ErrorMessage name="password" component="span"/>
                                        <Field id="inputCredentials" type="password" name="password" placeholder=""></Field>

                            <button className="loginButton" type="submit">Login!</button>
                                </Form>
                                                </Formik>


                                                
    </div>
    )
    
}

export default Login;