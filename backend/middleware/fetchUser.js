import jwt from 'jsonwebtoken';

const fetchuser = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).send({ error: 'Authenticate with valid token' });
  }
  console.log("middleware called")
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.info;
    console.log(req.user)
    next();
  } catch (err) {
    res.status(401).send({ error: 'Authenticate with valid token' });
  }
};

export default fetchuser;
