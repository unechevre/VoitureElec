const express = require("express");
const cors = require("cors");
const soap = require("soap");
const bodyParser = require("body-parser");

const app = express();
app.use(cors()); // Activez CORS pour toutes les origines
app.use(bodyParser.json());

const PORT = 3000;
const SOAP_URL = "http://127.0.0.1:8000/?wsdl";

app.post("/calculate-sum", (req, res) => {
  const { numbers } = req.body;

  soap.createClient(SOAP_URL, (err, client) => {
    if (err) {
      console.error("Erreur lors de la création du client SOAP:", err);
      return res
        .status(500)
        .send({ error: "Erreur lors de la connexion au service SOAP" });
    }

    const args = { numbers: { float: numbers } };

    client.CalculateSum(args, (err, result) => {
      if (err) {
        console.error("Erreur lors de l’appel au service SOAP:", err);
        return res
          .status(500)
          .send({ error: "Erreur lors de l’appel au service SOAP" });
      }

      res.send(result);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur intermédiaire Express écoutant sur le port ${PORT}`);
});
