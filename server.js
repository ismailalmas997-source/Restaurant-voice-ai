const express = require("express");
const axios = require("axios"); // Plus fiable pour Railway
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Check de vie
app.get("/", (req, res) => res.send("Restaurant Voice AI : ONLINE"));

// 1. Décrochage et enregistrement
app.post("/voice", (req, res) => {
  console.log(`[Twilio] Appel entrant de: ${req.body.From}`);
  
  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say voice="alice" language="fr-FR">Bonjour, nous vous écoutons. Passez votre commande après le bip.</Say>
      <Record action="/handle-record" maxLength="60" playBeep="true" />
    </Response>`);
});

// 2. Fin d'enregistrement et envoi à Make
app.post("/handle-record", async (req, res) => {
  const { RecordingUrl, From } = req.body;
  console.log(`[Twilio] Enregistrement reçu: ${RecordingUrl}`);

  if (RecordingUrl) {
    try {
      const makeWebhook = "https://hook.eu1.make.com/vtk7j7u07ax1ln6wnqjn0fu1fjlc7sry";
      
      await axios.post(makeWebhook, {
        recordingUrl: `${RecordingUrl}.mp3`,
        clientPhone: From,
        timestamp: new Date().toISOString()
      });
      
      console.log("[Make] Données transmises avec succès.");
    } catch (error) {
      console.error("[Erreur] Échec de l'envoi à Make:", error.message);
    }
  }

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say voice="alice" language="fr-FR">Merci, votre commande est en cours de traitement. Au revoir.</Say>
      <Hangup/>
    </Response>`);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));
