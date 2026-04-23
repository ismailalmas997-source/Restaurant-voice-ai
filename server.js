const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Vérification que le serveur est en ligne
app.get("/", (req, res) => {
  res.send("Restaurant Voice AI is running");
});

// 1. Point d'entrée de l'appel
app.post("/voice", (req, res) => {
  console.log("Appel Twilio reçu...");

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say voice="alice" language="fr-FR">
        Bonjour, nous vous écoutons, passez votre commande après le bip.
      </Say>
      <Record 
        action="/handle-record" 
        maxLength="30" 
        playBeep="true"
      />
    </Response>
  `);
});

// 2. Traitement une fois que le client a fini de parler
app.post("/handle-record", async (req, res) => {
  console.log("Enregistrement terminé !");
  
  const recordingUrl = req.body.RecordingUrl;
  const fromNumber = req.body.From;

  if (recordingUrl) {
    console.log("Envoi vers Make en cours...");

    try {
      // TON NOUVEAU LIEN MAKE ICI
      await fetch("https://hook.eu1.make.com/vtk7j7u07ax1ln6wnqjn0fu1fjlc7sry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordingUrl: recordingUrl + ".mp3",
          clientPhone: fromNumber,
          date: new Date().toISOString()
        })
      });
      console.log("Signal envoyé avec succès à Make !");
    } catch (error) {
      console.error("Erreur lors de l'envoi à Make:", error);
    }
  }

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say voice="alice" language="fr-FR">
        Merci, votre message est bien reçu. Au revoir.
      </Say>
      <Hangup/>
    </Response>
  `);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Serveur démarré sur le port " + PORT);
});
