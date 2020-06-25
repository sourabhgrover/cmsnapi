const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()



//route for Home Page

router.get('/', (req,res,next) =>{
    res.render('auth/signup')
})

//route for logout

// router.get('/logout', (req,res) => {
//     req.logout();
//     res.redirect('/')
// })


//Routes for Signup

// router.get('/signup', (req,res,next) =>{
//     res.render('auth/signup')
// })

//Route for registering a new user
router.post('/register', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

//Login the registered users
router.post('/login', async(req, res) => {
    //Login a registered user
    
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user })
    } catch (error) {
        res.status(400).send(error)
    }

})


router.get('/myaccount', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})


router.post('/myaccount/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/myaccount/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})


//Signup using Slack 
// router.get("/auth/slack", passport.authenticate("slack"))

// router.get("/auth/slack/callback", 
// passport.authenticate("slack", {
//     successRedirect: "/upload",
//     failureRedirect: "/"
// })
// )


//Signup using Google 

// router.get("/auth/google", passport.authenticate("google", {
//     scope: [
//         "https://www.googleapis.com/auth/userinfo.profile",
//         "https://www.googleapis.com/auth/userinfo.email"
//     ]
// })
// )

// router.get("/auth/google/callback", 
// passport.authenticate("google", {
//     successRedirect: "/upload",
//     failureRedirect: "/"
// })
// )

// router.post('/signup', (req,res,next) => {
//     const username  = req.body.username
//     const password  = req.body.password
//     const email     = req.body.email

//     if(!username || !password){
//         res.render('auth/signup', {message: 'Fill in the username and password'});
//         return;
//     }

//     User.findOne({username})
//     .then(user => {
//         if(user !== null){
//             res.render('auth/signup', {message: 'Username already exists !!'});
//             return;
//         }
        
//         const salt          = bcrypt.genSaltSync(bcryptSalt)
//         const hashPass      = bcrypt.hashSync(password, salt);
        
//         const newUser = new User ({
//             username, 
//             password: hashPass,
//             email, 
//             displayName: username
//         })
//         newUser.save();
//         res.redirect('/');
//     })
//     .catch(error => {
//         res.render('auth/signup', {message: 'Something went wrong'})
//     });
// });



// //Routes for Login

// router.get('/login', (req,res,next) => {
//     res.render('auth/login', {message: req.flash('error')})
// })

// router.post(
//     '/login', 
//     passport.authenticate('local', {
//         successRedirect: '/upload',
//         failureRedirect: '/signup', 
//         failureFlash: true,
//         passReqToCallback: true
//     })
// ); 


//routes for member 
// router.get('/upload', ensureLogin.ensureLoggedIn(), (req,res) => {
//     res.render('upload', {user: req.user} )
// })



//route to display all photos stored in the S3 Bucket

//Route for displaying all photos in the database
// router.get('/photo', (req,res,next) => {
//     Photo.find({user: req.user._id})
//       .then(photos => {
//         console.log('photos: ' ,photos)
//         res.render('photo', {photos: photos})
//     })
//     .catch(error => {
//       console.log('Error while getting the Photos from the DB: ', error);
//     })
//   });


//Route to Display all details of the user
// router.get('/myaccount', (req,res,next) => {
//     User.find({_id: req.user._id})
//       .then(user => {
//         console.log('user: ' ,user)
//         res.render('myaccount', {user: user})
//     })
//     .catch(error => {
//       console.log('Error while getting the Details of users: ', error);
//     })
//   });



  //Route to go to My Account Page 

//   router.get('/myaccount', ensureLogin.ensureLoggedIn(), (req,res) => {
//     res.render('myaccount', {user: req.user} )
// })


module.exports = router;