const express = require("express");
const axios = require("axios");
const twilio = require("twilio");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialisation du client Twilio pour la suppression
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get("/", (req, res) => res.send("IA Resto : ACTIVE (Sécurité Max)"));

// 1. Décrochage et Enregistrement
app.post("/voice", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say voice="alice" language="fr-FR">
        Bonjour. Pour votre sécurité, cet appel est enregistré, traité par l'I.A. puis supprimé. 
        Passez votre commande après le bip.
      </Say>
      <Record action="/handle-record" maxLength="60" playBeep="true" trim="trim-silence" />
    </Response>`);
});

// 2. Traitement, Envoi à Make et Suppression
app.post("/handle-record", async (req, res) => {
  const { RecordingUrl, From, RecordingSid } = req.body;
  const makeWebhook = process.env.MAKE_WEBHOOK_URL;

  if (RecordingUrl && makeWebhook) {
    try {
      // Envoi à Make
      await axios.post(makeWebhook, {
        recordingUrl: `${RecordingUrl}.mp3`,
        clientPhone: From,
        timestamp: new Date().toISOString()
      });
      console.log(`[OK] Transmis à Make pour l'appel: ${From}`);

      // SUPPRESSION AUTOMATIQUE (5 secondes après pour laisser Make télécharger)
      setTimeout(() => {
        client.recordings(RecordingSid).remove()
          .then(() => console.log(`[SÉCURITÉ] Enregistrement ${RecordingSid} supprimé de Twilio.`))
          .catch(err => console.error("[Erreur Suppression]", err.message));
      }, 5000);

    } catch (error) {
      console.error("[Erreur]", error.message);
    }
  }

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say voice="alice" language="fr-FR">Merci, votre commande est transmise. Au revoir.</Say>
      <Hangup/>
    </Response>`);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Serveur final sur port ${PORT}`));
