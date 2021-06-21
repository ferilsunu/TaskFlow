/*--------- Importing the controllers ---------*/
const express = require('express')
const router = express.Router()
const {
  getIndex,getLoginPage,
  getRegisterPage,createToDo,
  deleteToDo, registerUser,  
  getEditInfo,updateToDo,
  getProfilePage,
  postLogin,
  passportMiddleware,
  logout,
  notfound,
  putProfilePage
} = require('../controllers/indexController')
/*--------- End of Importing the controllers ---------*/

/*--------- Importing the required modules ---------*/
const {authenticatedChecker} = require('../config/authChecker')
const userModel = require('../models/user')
/*--------- End of importing the  modules ---------*/


/*--------- Passport js config ---------*/
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const {customFiledOptions,verifyCallback,serializeUser,deserializeUser} = require('../config/passportConfig')
const strategy = new LocalStrategy(customFiledOptions,verifyCallback)
passport.use(strategy)
passport.serializeUser(serializeUser);  
passport.deserializeUser(deserializeUser);
/*--------- end of Passport js config ---------*/



router.route('/')
.get(authenticatedChecker,getIndex)
.put(updateToDo)

router.route('/register')
.get(getRegisterPage)
.post(registerUser)

router.route('/profile')
.get(authenticatedChecker,getProfilePage)
.put(authenticatedChecker,putProfilePage)

router.route('/login').get(getLoginPage)
router.route('/login').post(passportMiddleware,postLogin)
router.get('/logout',logout)
router.route('/getEditInfo').post(getEditInfo)
router.get('*',notfound )
router.route('/:id').delete(deleteToDo)
router.route('/create').post(createToDo)



module.exports = router