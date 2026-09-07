const functions = require("firebase-functions");

exports.healthCheck = functions.https.onRequest((_req, res) => {
  res.status(200).send("PrefixFix backend is running.");
});
