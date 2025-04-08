const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const fetch = require('node-fetch');
const Recipe = require('./server/models/Recipe');
const metricsRoute = require('./metrics');
const routes = require('./server/routes/recipeRoutes'); // ✅ make sure this exists
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(expressLayouts);
app.use(cookieParser('CookingBlogSecure'));
app.use(session({
  secret: 'CookingBlogSecretSession',
  saveUninitialized: true,
  resave: true,
}));
app.use(flash());
app.use(fileUpload());

// EJS view engine
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Routes
app.use('/', routes);
app.use('/metrics', metricsRoute);
// app.use('/api/users', userRoutes); // ❌ comment this if you don't have userRoutes.js

// Contact page route
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
