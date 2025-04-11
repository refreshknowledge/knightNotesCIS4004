import React from "react";
import {Link} from "react-router-dom";
import '../PageNotFound.css';

function PageNotFound() {


    
    return (
        <div>
        <div className="pageNotFoundPageTitle"> Page not found!</div>
        <div className="pageNotFoundLink"> Quick link to the landing page: <Link to="/">Landing Page</Link> </div>
        </div>
    )
        
};

export default PageNotFound;