const express = require('express');
const router = express.Router();
const {Users} = require("../models");
const bcrypt = require("bcrypt");
const {sign} = require("jsonwebtoken");
const {authenticateUser} = require("../middleware/AuthenticationFunction");
const { Sequelize, Op } = require('sequelize');

// API to create an account.
router.post("/", async (req, res) => {
    try {
        
        const { user, password } = req.body;

        // Regex to only allow the alphabet, 0-9, and underscores.
        const validPattern = /^[a-zA-Z0-9_]+$/;

        if (!validPattern.test(user) || !validPattern.test(password)) {
            // Backend form validation returns when types of characters fail.
            return res.json({ signUpAnswer: "Username and password can only contain letters, numbers, and underscores." });
        }

    if (user.length < 4 || user.length > 20) {
        // Backend form validation returns when character count fails for the name.
        return res.json({ signUpAnswer: "Username must be between 4 and 20 characters." });
    }

    if (password.length < 5 || password.length > 20) {
        // Backend form validation returns when character count fails for the password.
        return res.json({ signUpAnswer: "Password must be between 5 and 20 characters." });
    }


        
        const existingUser = await Users.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user')), 
                Sequelize.fn('LOWER', user)
            )
        });

        if (existingUser) {
            // Return when a record is already created in Users with the same "user".
            return res.json({ signUpAnswer: "Choose a different username!" });
        }

        // Password is hashed when stored in MySQL
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a record in the Users table
        await Users.create({
            user: user,
            password: hashedPassword,
        });

        return res.json({ signUpAnswer: "Success!" });
    } catch (error) {
        return res.json({ signUpAnswer: "Invalid request!" });
    }
});

// API to log into Knight Notes with credentials.
router.post("/login", async (req, res) => {


    try {
    const {user, password} = req.body;

    // Get the Users record where user is equal to the user provided in the request.
    const person = await Users.findOne({where: {user: user}});

    if(!person)
    {
        // If no user record was found with the same user, then the error handling is to return.
        return res.json({error: "User is not in database"});
    }


    bcrypt.compare(password, person.password).then((correctPass) => {
        if(!correctPass)
        {
            // If the password provided in the request is not correct when compared to the hash in the database, return error.
            return res.json({error: "Wrong combination!"});
        }
        else
        {

            // If the password is correct, respond with an access token along the id and user.


            // ***********
            // Either input your own "secretstring" here, or you can leave it untouched. If you do change it, you NEED to change validToken in ../middleware/AuthenticationFunction to the same string.
            const accessToken = sign({user: person.user, id: person.id}, "secretstring" );
            // 
            // ***********
            
            return res.json({token: accessToken, user: person.user, id: person.id});
        }
    })

}
catch (error){
    return res.json("error");
}
})

// API to receive a response if the accessToken is legitimate.
router.get("/authenticate", authenticateUser, (req, res) => {

    try {
    // If the accessToken is legitmate, then this line runs to return to respond with a non erroneous response.
    return res.json(req.person);
}
catch (error){
    return res.json("error");
}
})

// API to respond with Users record with a given id of a Users record.
router.get("/bio/:id", authenticateUser, async (req, res) => {

    try {
    const id = req.params.id;

    // Gets the Users record from MySQL and excludes the password field.
    const bio = await Users.findByPk(id, {attributes: {exclude: ["password"]}});

    return res.json(bio);

}
catch (error){
    return res.json({errorMessage: "Invalid request!"});
}
})

// API to respond with Users record with a given user of a Users record.
router.get("/findIdByUsername/:username", authenticateUser, async (req, res) => {
    try {
        const username = req.params.username;

        // Gets the Users record from MySQL and excludes the password field.
        const bio = await Users.findOne({
            where: { user: username },
            attributes: { exclude: ["password"] }
        });

        
        if (!bio) {
            return res.json("error");
        }

        return res.json(bio);

    } catch (error) {
        return res.json("error");
    }
});

module.exports = router;