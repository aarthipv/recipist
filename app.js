const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const fetch = require('node-fetch'); // Import for fetch functionality
const Recipe = require('./server/models/Recipe');  // Correct path to Recipe model

const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const { OpenAI } = require('openai');  // Use OpenAI's package

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Your OpenAI API Key
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(expressLayouts);

app.use(cookieParser('CookingBlogSecure'));
app.use(
  session({
    secret: 'CookingBlogSecretSession',
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());
app.use(fileUpload());

// Set EJS as templating engine
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Load routes
const routes = require('./server/routes/recipeRoutes.js');
app.use('/', routes);

// AI Chatbot GET route
app.get('/ai', async (req, res) => {
  try {
      const recipe = await Recipe.findOne(); // Retrieve just one recipe
      const title = "AI Recipe Suggestions"; // Define the title
      res.render('ai', { title: title, recipe: recipe });
  } catch (err) {
      console.log(err);
      res.status(500).send('Error occurred while fetching recipe');
  }
});



app.post('/ai', async (req, res) => {
  const ingredients = req.body.ingredients;
  console.log('Received ingredients:', ingredients);

  try {
    // Call the OpenAI API to get recipe suggestions
    const response = await getRecipeSuggestions(ingredients);

    if (!response || !response.length) {
      req.flash('error', 'No recipe suggestions found for the given ingredients.');
      return res.render('ai', { title: 'AI Chatbot - Recipe Suggestion' });
    }

    // Render the recipes page with the suggestions
    res.render('recipes', { title: 'Recipe Suggestions', recipes: response });
  } catch (error) {
    console.error('Error generating recipes:', error);
    req.flash('error', 'There was an error fetching recipe suggestions. Please try again later.');
    res.redirect('/ai');  // Redirect back to the AI page on error
  }
});

// Helper function to get recipe suggestions from OpenAI
async function getRecipeSuggestions(ingredients) {
  try {
    // Format the ingredients and make a prompt for the AI model
    const prompt = `Suggest some recipes using the following ingredients: ${ingredients}. Please provide recipe names, ingredients, and instructions.`;

    // Call OpenAI API to generate suggestions
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',  // Or any model you want to use
      messages: [{ role: 'system', content: 'You are a helpful assistant that suggests recipes.' },
                { role: 'user', content: prompt }],
    });

    // Parse the AI response (you may need to adjust based on how the response is structured)
    const recipeSuggestions = aiResponse.choices[0].message.content;

    // Optionally, format the response into a more usable structure
    return recipeSuggestions ? recipeSuggestions.split('\n').map(recipe => {
      return {
        name: recipe,  // Example, you can parse this better
        ingredients: ingredients,  // Ingredients are still passed
        instructions: 'Instructions not available',  // Dummy instruction, adjust as needed
      };
    }) : [];
  } catch (error) {
    console.error('Error interacting with OpenAI API:', error);
    return [];
  }
}


// Start the server
app.listen(port, () => console.log(`Listening to port ${port}`));

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});
