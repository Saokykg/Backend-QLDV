const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.body.token;
  if (!authHeader) {
    const error = new Error('Not authenticated!');
    error.statusCode = 401;
    throw error;
    // res.redirect('/');
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
    // res.redirect('/');
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated!');
    error.statusCode = 401;
    throw error;
    // res.redirect('/');
  }
  next();
};
