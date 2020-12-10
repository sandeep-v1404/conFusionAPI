var express = require("express");
var router = express.Router();

const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
router.use(bodyParser.json());
var authenticate = require("../authenticate");
/* GET users listing. */
router.get(
    "/",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function(req, res, next) {
        User.find({})
            .then(
                (users) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(users);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    }
);
router.post("/signup", (req, res, next) => {
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ err: err });
                var err = new Error("User " + req.body.username + " already exists!");
                err.status = 403;
                next(err);
            } else {
                if (req.body.firstname) user.firstname = req.body.firstname;
                if (req.body.lastname) user.lastname = req.body.lastname;
                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json({
                            err: err,
                        });
                        return;
                    }
                    passport.authenticate("local")(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ success: true, status: "Registration Successful!" });
                    });
                });
            }
        }
    );
});

router.post("/login", passport.authenticate("local"), (req, res) => {
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, token: token, status: "Login Successful!" });
});

router.get("/logout", (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie("session-id");
        res.redirect("/");
    } else {
        var err = new Error("You are not logged in!");
        err.status = 403;
        next(err);
    }
});
module.exports = router;