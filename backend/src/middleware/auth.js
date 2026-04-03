import {auth} from "express-oauth2-jwt-bearer"
import dotenv from "dotenv";
dotenv.config();
export const jwtCheck = auth({
  audience:process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});
export const extractUserId = (req, res, next) => {
  // express-oauth2-jwt-bearer puts the decoded data in req.auth
  const sub = req.auth?.payload?.sub;
  
  if (!sub) {
    return res.status(401).json({ message: "Unauthorized: No User Sub found" });
  }

  req.userId = sub; 
  next();
};