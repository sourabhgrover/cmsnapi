require('dotenv').config();

const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const express       = require('express');
const favicon       = require('serve-favicon');
const hbs           = require('hbs');
const mongoose      = require('mongoose');
const logger        = require('morgan');
const path          = require('path');
const bcrypt        = require('bcrypt')
const session       = require('express-session')
const passport      = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User          = require('./models/user')
const flash         = require('connect-flash');
const SlackStrategy = require("passport-slack").Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const photo     = require('./models/photo')

mongoose
  .connect('mongodb+srv://mayank:residency18@cluster0-pu5tf.azure.mongodb.net/photobook', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(flash());
app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.use(
  session({
    secret: 'our-passport-local-strategy-app',
    resave: true,
    saveUninitialized: true
  })
)

passport.serializeUser((user, callback) => {
  callback(null, user._id);
});

passport.deserializeUser((id, callback) => {
  User.findById(id)
    .then(user => {
      callback(null, user);
    })
    .catch(error => {
      callback(error);
    });
});

passport.use(
  new LocalStrategy({
    passReqToCallback: true
  }, (req,username, password, callback) => {
    User.findOne({ username })
      .then(user => {
        if (!user) {
          return callback(null, false, { message: 'Incorrect username' });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return callback(null, false, { message: 'Incorrect password' });
        }
        callback(null, user);
      })
      .catch(error => {
        callback(error);
      });
  })
);


//Passport Slack Strategy
passport.use(
  new SlackStrategy(
    {
      clientID: "2432150752.1063707573680",
      clientSecret: "9a6ea7dc42e73d1a74f7fdb0c6cbf89b",
      callbackURL: "/auth/slack/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // to see the structure of the data in received response:
      console.log("Slack account details:", profile);

      User.findOne({ slackID: profile.id })
        .then(user => {
          if (user) {
            done(null, user);
            return;
          }

          User.create({ slackID: profile.id, displayName: profile.displayName})
            .then(newUser => {
              done(null, newUser);
            })
            .catch(err => done(err)); // closes User.create()
        })
        .catch(err => done(err)); // closes User.findOne()
    }
  )
);


//Google Login Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "791705976611-8lgnefdmmpk4fnhcipiejkik8ebtl3fc.apps.googleusercontent.com",
      clientSecret: "jsSC9u3SS7F3pE7WAty0QSsm",
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // to see the structure of the data in received response:
      console.log("Google account details:", profile);

      User.findOne({ googleID: profile.id })
        .then(user => {
          if (user) {
            done(null, user);
            return;
          }

          User.create({ 
            googleID: profile.id,
            username: profile.emails[0].value,
            displayName: profile.displayName,
            photo: profile.photos[0].value
          })
            .then(newUser => {
              done(null, newUser);
            })
            .catch(err => done(err)); // closes User.create()
        })
        .catch(err => done(err)); // closes User.findOne()
    }
  )
);



app.use(passport.initialize())
app.use(passport.session())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'CloudBox';

const Multer    = require('multer')
const aws       = require('aws-sdk')
const multerS3  = require('multer-s3') 
const s3        = new aws.S3();

aws.config.update({
  secretAccessKey : process.env.SECRET_KEY,
  accessKeyId     : process.env.ACCESS_KEY,
  region          : "eu-west-3"    
})


const uploader = new Multer({
  storage: multerS3({
    s3      : s3,
    bucket  : 'labironhack',
    acl     : 'public-read',
    key     : function(req, file, cb){
      cb(null, `${file.originalname}`)
    }
    })
  })


  

  app.post('/upload', uploader.single('image'), (req,res,next) => {
    console.log(req.body)
    console.log(req.file)
    photo.create({
      filename: req.file.originalname,
      imgPath: req.file.location,
      size: req.file.size,
      user: req.user._id
    })


    .catch(err => console.log(err))
    res.redirect('photo')
  })
  

//const index = require('./routes/index');

const router = require('./routes/auth-routes')
app.use('/', router);


module.exports = app;
