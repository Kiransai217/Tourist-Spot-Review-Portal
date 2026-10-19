require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const spotRoutes = require('./routes/spots');

const app = express();
// Render terminates HTTPS at its proxy; trust it so secure session cookies work.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
connectDB();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'dev-only-change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 7 }
};
if (process.env.MONGODB_URI) sessionOptions.store = MongoStore.create({ mongoUrl: process.env.MONGODB_URI, collectionName: 'sessions' });
app.use(session(sessionOptions));
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.get('/', (req, res) => res.render('home', { title: 'Discover places worth remembering' }));
app.use('/', authRoutes);
app.use('/spots', spotRoutes);
app.use((req, res) => res.status(404).render('404', { title: 'Page not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  req.session.flash = { type: 'error', message: 'Something went wrong. Please try again.' };
  res.redirect(req.get('Referrer') || '/spots');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Tourist Spot Review Portal running on port ${PORT}`));
