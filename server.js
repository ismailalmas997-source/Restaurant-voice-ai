const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Restaurant Voice AI is running");
});

app.post("/voice", (req, res) => {
  console.log("Call received");

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say voice="alice" language="fr-FR">
        Bonjour et bienvenue au restaurant.
        Merci de dire votre nom ainsi que votre commande après le bip.
      </Say>
      <Record maxLength="30" />
    </Response>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
