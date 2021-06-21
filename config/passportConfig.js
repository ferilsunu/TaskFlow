const LocalStrategy = require('passport-local').Strategy
const userModel = require('../models/user')
const bcrypt = require('bcryptjs')
module.exports = {
    customFiledOptions: {usernameField: 'email'},
    verifyCallback: (email,password,done)=>{
        
        userModel.findOne({email:email}).then((user)=>{
            if (!user) {
             
              return done(null,false,{message: "Incorrect login details"})
            }
      
            bcrypt.compare(password,user.password,(err,matched)=>{
      
            if(err) {
          
              return err
            }
            if(matched){
                
                return done(null,user)
            }else {
            
              return done(null,false,{message:"Incorrect login details"})
            
            }
      
      
         })
            
      
                                                    })
      
      },
    serializeUser: function(user, done) {
        done(null, user.id);
      },
    deserializeUser: function(id, done) {
        userModel.findById(id, function(err, user) {
          done(err, user);
        });
      }

    
   
  
    
}