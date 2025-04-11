const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
const db = require('./models');

const userRouter = require('./routes/Users');
app.use("/users", userRouter);
const quizRouter = require('./routes/Quizzes');
app.use("/quizzes", quizRouter);
const scoreRouter = require('./routes/Scores');
app.use("/scores", scoreRouter);
const commentRouter = require('./routes/Comments');
app.use("/comments", commentRouter);
const likeRouter = require('./routes/Likes');
app.use("/likes", likeRouter);

db.sequelize.sync().then(() => {

    app.listen(3001, () => {
        console.log("Port 3001 is running Knight Notes' server.");
    });
});
