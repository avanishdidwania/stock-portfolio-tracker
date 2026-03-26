const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User')

router.get('/test', (req,res)=>{
   res.send("AUTH ROUTE WORKING");
});

// Register
router.post('/register', async (req, res) => {
    const {name, email, password} = req.body;

    try{
        //Checks if user already exists
        let user = await User.findOne({email});
        if(user) return res.status(400).json({msg: 'User already exists'});

        //Create new user 

        user = new User({name, email, password});

        //Hash the password;
        const salt =  await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        //Save to database
        await user.save();

        //create JWT token
        const payload = { user: {id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn : '7d'}, (err, token) => {
            if (err) throw err;
            res.json({token}); 
        });

    }catch (err) { 
        res.status(500).json({msg : 'Server error'});
    }
});

//Login

router.post('/login', async(req, res) =>{
    const {email, password} = req.body;

    try{
        //check if user exists
        let user = await User.findOne({email});
        if(!user) return res.status(400).json({msg:'Invalid credentials'});

        //check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({msg:'Invalid credentials'});

        //create JWT Token
        const payload = { user: {id: user.id} };
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn : '7d'}, (err, token) => {
            if(err) throw err;
            res.json({token});
        });
    }catch (err){
        res.status(500).json({msg: 'Server error'});
    }
});

module.exports = router;