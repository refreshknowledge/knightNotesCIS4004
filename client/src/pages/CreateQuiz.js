import React, { useContext, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthenticateContext } from "../AuthenticateContext";
import '../CreateQuiz.css';

function CreateQuiz() {

  let navigate = useNavigate();
  const { authenticateState } = useContext(AuthenticateContext);

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: [
        { optionText: "", answer: false },
        { optionText: "", answer: false },
        { optionText: "", answer: false },
        { optionText: "", answer: false }
      ]
    }
  ]);

  // If there is no accessToken the user has, then send user to the login screen.
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    }
  }, [authenticateState]);

  // Frontend form validation to ensure the request will be accepted.
  const validationSchema = Yup.object({
    title: Yup.string()
      .min(1, "Title must be at least 1 character.")
      .max(100, "Title must not exceed 100 characters.")
      .required("Quiz title is required."),
    question: Yup.string()
      .min(1, "Description must be at least 1 character.")
      .max(100, "Description must not exceed 100 characters.")
      .required("Quiz description is required."),
    questions: Yup.array().of(
      Yup.object({
        questionText: Yup.string()
          .min(1, "Question text must be at least 1 character.")
          .max(100, "Question text must not exceed 100 characters.")
          .required("Question text is required."),
        options: Yup.array().of(
          Yup.object({
            optionText: Yup.string()
              .min(1, "Option must be at least 1 character.")
              .max(100, "Option must not exceed 100 characters.")
              .required("Option text is required."),
            answer: Yup.boolean()
          })
        ).test('one-answer-required', 'Please select an answer for this question', (options) => {
          
          return options && options.some(option => option.answer === true);
        })
      })
    )
  });

  return (
    <div>
      <div><div className="createQuizzesPageTitle">Create a quiz!</div>

        <div><ol className="createQuizzesRules">
          
          <li className="createQuizzesRulesItem">Fill in every field with 1 to 100 characters inclusively.</li>
          <li className="createQuizzesRulesItem">Select a radio button for each question to indicate the correct answer.</li>
          <li className="createQuizzesRulesItem">Select "Add Question" or "Remove Question" as you see fit.</li>
          <li className="createQuizzesRulesItem">Finally, click "Create Quiz" to post it for other users to begin studying with!</li>
          
          </ol></div>
      </div>
    <Formik
      initialValues={{
        title: "", // Quiz title
        question: "", // Quiz description
        questions, // Set initial questions state here
      }}
      validationSchema={validationSchema} // Add validation schema
      enableReinitialize={true} // Ensures the form re-renders when questions change
      onSubmit={async (values) => {
        try {
          const response = await axios.post("http://localhost:3001/quizzes", {
            title: values.title,
            question: values.question, // Add the description field
            questions: values.questions, // Add the questions
          }, {
            headers: { accessToken: localStorage.getItem("accessToken") }
          });
          navigate("/");
        } catch (error) {
          alert("Error");
          
        }
      }}
    >
      {({ setFieldValue, values, errors, touched }) => (
        <Form>
          <div>
            <div className="titleAndDescContainer">
            <label htmlFor="title">Quiz Title</label>
            <Field
              id="title"
              name="title"
              type="text"
            />
            <ErrorMessage name="title" component="div" className="error" />
          </div>

          <div>
            <label htmlFor="question">Quiz Description</label>
            <Field
              id="question"
              name="question"
              type="text"
            />
            <ErrorMessage name="question" component="div" className="error" />
          </div></div>

          {/* Loop through each question */}
          <div className="questionQuizContainer">
          {values.questions.map((question, qIndex) => (
            <div key={qIndex}>
              <div>
                <div className="questionTextQuizContainer">
                <label htmlFor={`questions[${qIndex}].questionText`}>
                  Question {qIndex + 1}
                </label>
                <Field
                  id={`questions[${qIndex}].questionText`}
                  name={`questions[${qIndex}].questionText`}
                  type="text"
                />
                <ErrorMessage name={`questions[${qIndex}].questionText`} component="div" className="error" />
                </div>
              </div>

              {/* Loop through each option for this question */}
              <div className="optionChoiceQuizContainer">{question.options.map((option, oIndex) => (
                <div key={oIndex}>
                  <div className="optionChoiceTextAQuizContainer">
                  <div className="optionChoiceTextLabelQuizContainer">
                  <label htmlFor={`questions[${qIndex}].options[${oIndex}].optionText`}>
                    Option {oIndex + 1}
                  </label></div>
                  <div className="optionChoiceTextBQuizContainer">
                  <Field
                    id={`questions[${qIndex}].options[${oIndex}].optionText`}
                    name={`questions[${qIndex}].options[${oIndex}].optionText`}
                    type="text"
                  />
                  <ErrorMessage name={`questions[${qIndex}].options[${oIndex}].optionText`} component="div" className="error" />
                  </div></div>


<div className="radioContainer">
                  <label>
                    Correct Answer
                    <Field
                      type="radio"
                      name={`questions[${qIndex}].options[${oIndex}].answer`}
                      value={true}
                      checked={option.answer}
                      onChange={() => {
                        const updatedOptions = values.questions[qIndex].options.map((opt, idx) => {
                          if (idx === oIndex) {
                            return { ...opt, answer: true }; // set the selected option to true
                          }
                          return { ...opt, answer: false }; // set others to false
                        });

                        setFieldValue(`questions[${qIndex}].options`, updatedOptions);
                      }}
                    />
                  </label></div>
                </div>
              ))}</div>

              {/* Remove question button */}
              <div className="removeQuestionButton">
              <button type="button" onClick={() => {
                const updatedQuestions = [...values.questions];
                updatedQuestions.splice(qIndex, 1); // Remove the question at the specific index
                setFieldValue("questions", updatedQuestions); // Update the questions array in Formik
              }}>
                Remove Question
              </button>
              </div>
            </div>
          ))}</div>

<div className="addNewQuestionButton">
          {/* Add new question button */}
          <button type="button" onClick={() => {
            const updatedQuestions = [...values.questions, {
              questionText: "",
              options: [
                { optionText: "", answer: false },
                { optionText: "", answer: false },
                { optionText: "", answer: false },
                { optionText: "", answer: false }
              ]
            }];
            setFieldValue("questions", updatedQuestions); // Update the questions array in Formik
          }}>
            Add Question
          </button></div>

          {/* Submit button */}
          <div className="addSubmitCreatedQuizButton">
          <button type="submit" disabled={Object.keys(errors).length > 0}>
            Create Quiz
          </button></div>
        </Form>
      )}
    </Formik>
    </div>
  );
}

export default CreateQuiz;
