const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//User Model
const User = require('../models/User')
// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2){
        errors.push({ msg: 'Please fill in all fields!' });
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6){
        errors.push({ msg: 'Password too short! Should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }else{
        User.findOne({ email: email })
            .then((user) => {
                if(user){
                    errors.push({ msg: "User with email already exists!" })
                    //user exists already
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }else {
                    //create a new user
                    const newUser = new User({
                        name, 
                        email,
                        password
                    });
                    
                    //Hash password
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                          if (err) throw err;
                          //Set password to hashed
                          newUser.password = hash;
                          //Save the user
                          newUser.save()
                            .then(() => {
                                req.flash('success_msg', 'You are now registered and can log in!');
                                res.redirect('/users/login');
                            })
                            .catch(console.log);
                    }))
                }
            });
    }
});

module.exports = router;