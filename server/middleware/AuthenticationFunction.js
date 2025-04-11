const {verify} = require("jsonwebtoken");

// Middleware to identify if the accessToken is legitimate, if so, then it gives the server's function the user's id and username.
const authenticateUser = (req, res, next) => {
    const accessToken = req.header("accessToken");

    if (!accessToken)
    {
        // accessToken was not given
        return res.json({error: "Not logged in"});
    }

    try{
        // ***********
        // Either input your own "secretstring" here, or you can leave it untouched. If you do change it, you NEED to change accessToken in ../routes/Users to the same string.
        const validToken = verify(accessToken, "secretstring");
        // 
        // ***********

        req.person = validToken;

        if(validToken)
        {
            // Legitimate
            return next();
        }
        else{
            // Not legitimate
            return res.json({error: "Not a valid token"});
        }
    }
    catch(err)
    {
        return res.json({error: "Invalid request!"});
    }
};

module.exports = {authenticateUser};