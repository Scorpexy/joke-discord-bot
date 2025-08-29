const express = require('express');
const app = express();
const port = 3000;

// Start with some default jokes
const jokes = [
  "why did chicken cross road, to get to other side",
  "why do javascript developers need glasses, they cant c#"
];

console.log("✅ Booting joke API with /jokes route enabled");


app.use(express.json());

// Root
app.get('/', (req, res) => {
  res.send('AA');
});

// Hello
app.get('/hello', (req,res) => {
  res.send("Hello, world!");
});

// Add a new joke
app.post("/addjoke", (req,res) => {
  const newJoke = req.body.joke;
  if (!newJoke || typeof newJoke !== 'string') {
    return res.status(400).json({ error: "You must send a joke string" });
  }
  jokes.push(newJoke);
  res.json({ message: "Joke Added!", allJokes: jokes });
});

// Get a random joke
app.get('/joke', (req,res) => {
  if (!jokes.length) return res.json({ joke: null });
  const randomIndex = Math.floor(Math.random() * jokes.length);
  const randomJoke = jokes[randomIndex];
  // Wrap it in { joke: ... } so the bot can read d.joke
  res.json({ joke: randomJoke });
});

// ✅ NEW: Get all jokes
app.get('/jokes', (req,res) => {
  res.json({ jokes });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
