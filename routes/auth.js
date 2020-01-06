const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();
const registerValidationFields = [
  check('email', 'Email is invalid').isEmail(),
  check('password', 'Password should contain at least six characters').isLength({ min: 6 }),
];
const loginValidationFields = [
  check('email', 'Email is invalid').normalizeEmail().isEmail(),
  check('password', 'Password should contain at least six characters').isLength({ min: 6 }),
];

const return400IfUserExists = (user, res) =>
  user && res.status(400).json({ message: 'Email already exists'});
const return400IfErrors = (errors, res) =>
  !errors.isEmpty() && res.status(400).json({
    errors: errors.array(),
    message: 'Invalid data'
  });

router.post('/register', registerValidationFields, async (req, res) => {
  try {
    const errors = validationResult(req);
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    return400IfErrors(errors, res);
    return400IfUserExists(candidate, res);

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: 'User has been created'});
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong'})
  }
});

router.post('/login', loginValidationFields, async (req, res) => {
  try {
    const errors = validationResult(req);
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found'});

    const isMatchPassword = await bcrypt.compare(password, user.password);

    if(!isMatchPassword) return res.status(400).json({ message: 'Incorrect password'});
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong'})
  }
});
