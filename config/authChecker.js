module.exports = {
    authenticatedChecker: function(req,res,next){
        if(req.isAuthenticated()){
            //req.isAuthenticated() will return true if user is logged in
            next();
        } else{
            req.flash('error','please sign to use the app')
            res.redirect("/login");
        }
    }
}