const express = require('express');
const connectDB = require('../db'); // import the db connection

const app = express();

// Connect to the database
connectDB();

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Export the express app for Vercel
module.exports = app;


// Not needed as vercel expects serverless functions to export a request handler.
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
