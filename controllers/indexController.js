const todoModel = require('../models/todo')
const userModel = require('../models/user')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { findByIdAndUpdate } = require('../models/todo');



module.exports = {
    getIndex: async (req , res)=>{      
        const fetched_todo = await todoModel.find({user:req.user._id}).lean()
        todoModel.countDocuments({user:req.user._id},(err,count)=>{

            const logged_user_name = {user: req.user.name}
            const logged_user_pic = {user: req.user.pic}
            const total_tasks = count
            res.render('index',{fetched_todo:fetched_todo, user: logged_user_name, user_pic: logged_user_pic,total_tasks:total_tasks}) 


        })

        
    
     },
    getLoginPage: (req,res)=>{
        res.render('login')
    },
    getRegisterPage: (req,res)=>{
        res.render('register')
    },
    createToDo: async (req,res)=>{
        await new todoModel({description: req.body.description, user: req.user._id}).save()
        req.flash('success_message','ToDo created')
        res.redirect('/')

    },
    deleteToDo: async (req,res)=>{
        const id = req.params.id
        await todoModel.findByIdAndDelete({_id:id})
        req.flash('error','ToDo Deleted')
        res.redirect('/')
    },

    getEditInfo:  async (req,res)=>{
      
        const id = req.body.new_id
        const fetched_data = await todoModel.findOne({_id:id})
        res.send(fetched_data)
    
      
    },

    updateToDo: async (req,res)=>{
    const update_id = req.params.id
    await todoModel.findByIdAndUpdate({_id:req.body.todo_id},{description:req.body.description})
    req.flash('success_message','ToDo Edited')
    res.redirect('/')    
    },

    registerUser: async (req,res)=>{


        
        const fetch_user = await userModel.findOne({email:req.body.email})
        if (!fetch_user) {

            const new_user = await new userModel({name: req.body.name,email: req.body.email,password:req.body.password})
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                new_user.password = hash
                new_user.save()
                });
            });
            req.flash('success_message', 'User Created, Please login')
            res.redirect('/login')
                
        } else {
            req.flash('error', 'User exists, Please login')
            res.redirect('/login')
        }


     
    },

    getProfilePage: async (req,res)=>{
        
        const fetched_user = await userModel.findOne({_id:req.user._id}).lean()
        res.render('profile',{
            fetched_user:fetched_user
        })
    
    },

    postLogin: (req,res)=>{res.redirect('/')},

    passportMiddleware: passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true}),

    logout: (req, res) => {
        req.logout();
        res.redirect('/');
      },

    notfound: (req, res) => {
        res.status(404).render('404')
      },

    putProfilePage: async (req,res)=>{

    if(req.files) {    
        let filename = Date.now() + '-' + req.files.pic.name
        req.files.pic.mv('./public/uploads/'+filename,(err)=>{
            if(err){
                return err
            }
        
        })


    await userModel.findByIdAndUpdate({_id: req.user._id},{name: req.body.name, designation:req.body.designation, pic: filename})
    req.flash('success_message', 'Profile info updated')
    res.redirect('/profile')
    }
    else {

    await userModel.findByIdAndUpdate({_id: req.user._id},{name: req.body.name, designation:req.body.designation})
    req.flash('success_message', 'Profile info updated')
    res.redirect('/profile')


    }





}

      

    




 





}