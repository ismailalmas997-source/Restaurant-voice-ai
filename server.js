const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Restaurant Voice AI is running");
});

app.post("/voice", async (req, res) => {
  console.log("Twilio callback received");

  const recordingUrl = req.body.RecordingUrl;

  if (recordingUrl) {
    console.log("Recording URL:", recordingUrl);

    await fetch("https://hook.eu1.make.com/niek035xjpedozut1nzt1xo8yi3wbfx5", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recordingUrl: recordingUrl + ".mp3"
      })
    });
  }

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say voice="alice" language="fr-FR">
        Merci, votre commande a bien été enregistrée.
      </Say>
      <Hangup/>
    </Response>
  `);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
