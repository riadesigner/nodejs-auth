require('dotenv').config()

const express = require('express')
const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;

const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID;
const YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET;

function isAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
};

passport.serializeUser((user,done)=>{
    done(null, user);
})
passport.deserializeUser((obj,done)=>{
    done(null, obj);
})

passport.use(
    new YandexStrategy({
        clientID: YANDEX_CLIENT_ID,
        clientSecret: YANDEX_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/yandex/callback",                
    },
    (accessToken, refreshToken, profile, done) => {
        process.nextTick(()=>{
            return done(null, profile);
        })
    })
);

// console.log(process.env.)
const app = express();
app.use(require('cookie-parser')())
app.use(require('express-session')({    
    secret: process.env.SESSION_SECRET,    
    // resave: false,
    // saveUninitialized: true,
    // cookie: { secure: true }
}))

app.set('view engine','ejs');
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res)=>{
    res.render('index',{user: req.user});
});

app.get('/account', 
    isAuthenticated,
    (req, res)=>{
    res.json({user: req.user});
});

app.get('/auth/yandex', 
    passport.authenticate('yandex')
);

app.get('/auth/yandex/callback', 
    passport.authenticate('yandex', {failureRedirect: '/'}),
    (req, res)=>{
        console.log('req.user=',req.user)
        res.redirect('/')
    }
);

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`server started  http://localhost:${PORT}`);
});




