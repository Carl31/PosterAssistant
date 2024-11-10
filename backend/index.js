const express = require('express');
const connectDB = require('./db'); // import the db connection

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
