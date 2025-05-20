const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(400).json({ msg: "Invalid Authentication" });
    }

    // Accept both: "Bearer <token>" and "<token>" formats
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(400).json({ msg: "Invalid Authentication" });
      }

      req.user = user;
      next();
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};


module.exports = auth;