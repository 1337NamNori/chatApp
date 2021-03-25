const express = require('express');
const router = express.Router();
const cfg = require('../common/config')
const db = require('../common/database')
const passport = require('passport')

/* GET home page. */
router.get('/',checkNotAuthenticated, function(req, res, next) {
  res.render('index',{title:'ChatApp | Log In'});
});

router.get('/signup',checkNotAuthenticated,  function(req, res, next) {
  res.render('signup',{title:'ChatApp | Sign Up'});
});

router.get('/messages',checkAuthenticated, function(req, res, next) {
  res.render('messages',{title:'ChatApp | Messages',user:req.user});
});

// POST 

router.post('/',checkNotAuthenticated,  function(req, res, next) {
  passport.authenticate('local.login',
    function (err, user, info) {
      if (!user) {
        console.log(info)
        res.render('index', { title: 'ChatApp | Log In', info });

      } else {
        req.login(user, function (err) {
          if (err) {
            // console.log(err);
            console.log(info)
            res.render('index', { title: 'ChatApp | Log In', info });
            return;
          }
          // console.log(user)
          res.redirect('/messages');
        });
      }
    })(req, res, next);
})

router.post('/signup', checkNotAuthenticated, passport.authenticate('local.register', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}))

// function
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    //req.m = 'hello'
    return next()
  }
  res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/messages')
  }
  next()
}

module.exports = router;
