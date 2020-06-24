const express       = require ('express')
const router        = express.Router();
const User          = require('../models/user')
const bcrypt        = require('bcrypt');
const bcryptSalt    = 10;
const passport      = require('passport')
const ensureLogin   = require('connect-ensure-login');
const flash         = require('connect-flash')
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Photo          = require('../models/photo')



//route for Home Page

router.get('/', (req,res,next) =>{
    res.render('auth/signup')
})

//route for logout

router.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/')
})


//Routes for Signup

router.get('/signup', (req,res,next) =>{
    res.render('auth/signup')
})



//Signup using Slack 
router.get("/auth/slack", passport.authenticate("slack"))

router.get("/auth/slack/callback", 
passport.authenticate("slack", {
    successRedirect: "/upload",
    failureRedirect: "/"
})
)


//Signup using Google 

router.get("/auth/google", passport.authenticate("google", {
    scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
    ]
})
)

router.get("/auth/google/callback", 
passport.authenticate("google", {
    successRedirect: "/upload",
    failureRedirect: "/"
})
)

router.post('/signup', (req,res,next) => {
    const username  = req.body.username
    const password  = req.body.password
    const email     = req.body.email

    if(!username || !password){
        res.render('auth/signup', {message: 'Fill in the username and password'});
        return;
    }

    User.findOne({username})
    .then(user => {
        if(user !== null){
            res.render('auth/signup', {message: 'Username already exists !!'});
            return;
        }
        
        const salt          = bcrypt.genSaltSync(bcryptSalt)
        const hashPass      = bcrypt.hashSync(password, salt);
        
        const newUser = new User ({
            username, 
            password: hashPass,
            email, 
            displayName: username
        })
        newUser.save();
        res.redirect('/');
    })
    .catch(error => {
        res.render('auth/signup', {message: 'Something went wrong'})
    });
});



//Routes for Login

router.get('/login', (req,res,next) => {
    res.render('auth/login', {message: req.flash('error')})
})

router.post(
    '/login', 
    passport.authenticate('local', {
        successRedirect: '/upload',
        failureRedirect: '/signup', 
        failureFlash: true,
        passReqToCallback: true
    })
); 


//routes for member 
router.get('/upload', ensureLogin.ensureLoggedIn(), (req,res) => {
    res.render('upload', {user: req.user} )
})



//route to display all photos stored in the S3 Bucket

//Route for displaying all photos in the database
router.get('/photo', (req,res,next) => {
    Photo.find({user: req.user._id})
      .then(photos => {
        console.log('photos: ' ,photos)
        res.render('photo', {photos: photos})
    })
    .catch(error => {
      console.log('Error while getting the Photos from the DB: ', error);
    })
  });


//Route to Display all details of the user
router.get('/myaccount', (req,res,next) => {
    User.find({_id: req.user._id})
      .then(user => {
        console.log('user: ' ,user)
        res.render('myaccount', {user: user})
    })
    .catch(error => {
      console.log('Error while getting the Details of users: ', error);
    })
  });



  //Route to go to My Account Page 

  router.get('/myaccount', ensureLogin.ensureLoggedIn(), (req,res) => {
    res.render('myaccount', {user: req.user} )
})


module.exports = router;