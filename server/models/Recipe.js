const mongoose = require('mongoose');

// Define Recipe Schema
const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'Recipe name is required.',
    trim: true, // Trim spaces around the name
  },
  description: {
    type: String,
    required: 'Description is required.',
    trim: true, // Trim spaces around the description
  },
  email: {
    type: String,
    required: 'Email is required.',
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address.'], // Basic email validation
  },
  ingredients: {
    type: [String], // Array of strings for ingredients
    required: 'Ingredients are required.',
    validate: [arrayLimit, 'You must enter at least one ingredient.'],
  },
  category: {
    type: String,
    enum: ['Thai', 'American', 'Chinese', 'Mexican', 'Indian'],
    required: 'Category is required.',
  },
  image: {
    type: String,
    required: 'Image URL is required.', // Make image required, or make it optional if necessary
  },
});

// Validate that ingredients array is not empty
function arrayLimit(val) {
  return val && val.length > 0;
}

// Text Indexing for full-text search on name and description
recipeSchema.index({ name: 'text', description: 'text' });

// Optional wildcard index if you xneed full-text search across all fields
// recipeSchema.index({ "$**" : 'text' });

// Export the Recipe model
module.exports = mongoose.model('Recipe', recipeSchema);
