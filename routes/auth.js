const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

router.get('/register', (req, res) => res.render('auth/register', { title: 'Create account', errors: [] }));
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render('auth/register', { title: 'Create account', errors: errors.array() });
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email: email.toLowerCase().trim() })) {
      return res.status(400).render('auth/register', { title: 'Create account', errors: [{ msg: 'An account with this email already exists.' }] });
    }
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    req.session.user = { id: user._id.toString(), name: user.name, email: user.email };
    req.session.flash = { type: 'success', message: `Welcome to SpotScout, ${user.name}!` };
    res.redirect('/spots');
  } catch (error) { next(error); }
});

router.get('/login', (req, res) => res.render('auth/login', { title: 'Welcome back', errors: [] }));
router.post('/login', async (req, res, next) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) {
      return res.status(400).render('auth/login', { title: 'Welcome back', errors: [{ msg: 'Email or password is incorrect.' }] });
    }
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.user = { id: user._id.toString(), name: user.name, email: user.email };
      req.session.flash = { type: 'success', message: `Welcome back, ${user.name}!` };
      res.redirect('/spots');
    });
  } catch (error) { next(error); }
});

router.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));
module.exports = router;
