const { Issuer } = require("openid-client");

let client;

async function getOIDCClient() {
  if (client) return client;

  const issuer = await Issuer.discover(
    "https://test.login.w3.ibm.com/oidc/endpoint/default"
  );

  client = new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uris: ["http://localhost:8080/auth/callback"],
    response_types: ["code"],
  });

  return client;
}

module.exports = { getOIDCClient };
