const express = require("express");
const { getOIDCClient } = require("../auth/oidcClient");

const router = express.Router();

/**
 * STEP 1: Redirect user to IBM Verify
 */
router.get("/login", async (req, res, next) => {
  try {
    const client = await getOIDCClient();

    const authorizationUrl = client.authorizationUrl({
      scope: "openid profile email",
    });

    res.redirect(authorizationUrl);
  } catch (err) {
    next(err);
  }
});

/**
 * STEP 2: Handle callback & extract user from ID token
 */
router.get("/callback", async (req, res, next) => {
  try {
    const client = await getOIDCClient();

    const params = client.callbackParams(req);

    const tokenSet = await client.callback(
      "http://localhost:8080/auth/callback",
      params
    );

    // 🔑 EXTRACT USER DETAILS HERE
    const claims = tokenSet.claims();

    console.log("✅ ID TOKEN CLAIMS:");
    console.log(claims);

    req.session.user = {
      id: claims.sub,
      displayName: claims.name,
      email: claims.email,
    };

    res.redirect("/debug-user");
  } catch (err) {
    console.error("OIDC callback error:", err);
    next(err);
  }
});

/**
 * STEP 3: Logout
 */
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

module.exports = router;
