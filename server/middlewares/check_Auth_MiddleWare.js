
const checkAuth = (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  req.password = token;
  next();
};

export default checkAuth;