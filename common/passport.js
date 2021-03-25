const LocalStrategy = require("passport-local").Strategy
//const userUtil = require('./userUtil')
const cfg = require("./config")
const db = require('./database')


module.exports = function (passport) {
  // Local Login
  passport.use(`local.login`,
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, done) => {
        // valid = userUtil.validateNotNull(email)
        // valid = valid && userUtil.validateNotNull(password)
        let valid = true
        if (valid) {
          // Match user
          db.query(
            `select * from users where user_email = ${db.escape(email)} and user_password = ${db.escape(password)}`
          ).then(rows => {
            if (rows.length <= 0) {
              return done(null, false, { message: "Email / mật khẩu không chính xác." });
            }
            let user = rows[0];

            return done(null, user);
          });
        }
        else {
          return done(null, false, { message: "Email / mật khẩu không chính xác." });
        }
      }
    )
  );

  passport.use('local.register',
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        // emailField: "email",
        passReqToCallback: true
      },
      (req, username, password, done) => {
        process.nextTick(async function () {
          // Match user
          // console.log(username, password, req.body.email)
          // valid = await userUtil.validateNewUsername(username)
          // valid = valid & await userUtil.validatePassword(password)
          let query = `select * from users`
          let users = await db.query(query)
          if(users.some(user => user.user_email === req.body.email))  {
            return done(null, false, { message: 'Email này đã được đăng ký trước đây.' });
          }
          if(users.some(user => user.username === username))  {
            return done(null, false, { message: 'Username này đã được đăng ký trước đây.' });
          }

          let valid = true
          if (valid) {
            //let name = req.body.name
            query = `insert into users set ` +
              `username = ${db.escape(username)}, ` +
              `user_email = ${db.escape(req.body.email)}, ` +
              `user_password= ${db.escape(password)} `

            ret = await db.query(query)
            let newUser = new Object()
            newUser.user_id = ret.insertId
            return done(null, newUser)
          }
          else {
            return done(null, false, { message: 'Không thể đăng kí với thông tin này.' });
          }
        })
      })
  );

  // passport.use('change-password',
  //   new LocalStrategy(
  //     {
  //       passwordField: "password",
  //       newPasswordField: "newPassword",
  //       verifyPasswordField: "verifyPassword",
  //       passReqToCallback: true
  //     }, (req, password, newPassword, verifyPassword, done) => {


  //       let valid = true
  //       if (valid) {
  //             if (newPassword!=verifyPassword) {
  //               return done(null, false, { message: "Mật khẩu xác minh khongo giống mật khẩu mới. Vui long nhập lại " });
  //             } 
  //             let sql = `
  //                       update user set 
  //                       password
  //             `
  //       } else {
  //         return done(null, false, { message: 'Không thể đổi mật khẩu' });
  //       }
  //     })
  // )



  // Remember Me 
  //   passport.use(
  //     new RememberMeStrategy(
  //       function (token, done) {
  //         Token.consume(token, function (err, user) {
  //           if (err) {
  //             return done(err);
  //           }
  //           if (!user) {
  //             return done(null, false);
  //           }
  //           return done(null, user);
  //         });
  //       },
  //       function (user, done) {
  //         var token = utils.generateToken(64);
  //         Token.save(token, { userId: user.id }, function (err) {
  //           if (err) {
  //             return done(err);
  //           }
  //           return done(null, token);
  //         });
  //       }
  //     )
  //   );

  var userCache = {}

  passport.serializeUser(function (user, done) {
    let id = user.user_id
    userCache[id] = user
    done(null, id);
  });

  passport.deserializeUser(function (id, done) {
    done(null, userCache[id]);
  });
};
