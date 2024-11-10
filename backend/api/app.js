const express = require('express');
const connectDB = require('../db'); // import the db connection

const app = express();

// Connect to the database before setting up routes
connectDB().then(() => {
  console.log('No errors with DB connection.');
}).catch((err) => {
  console.error("Failed to connect to DB:", err);
  process.exit(1); // Exit if DB connection fails
});

// Define routes
app.get('/api', (req, res) => {
  res.send('Hello from Express API!');
});

// If running locally, use app.listen
if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the Express app as a serverless function for Vercel
module.exports = (req, res) => {
  app(req, res);
};
