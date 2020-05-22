const jwt = require('jsonwebtoken');
/* TOken verification */

let tokenVerification= (req,res,next) => {
  /* Get the header propertie to get token */
  let header = req.get('Authorization');
  /* Getting the token string from all value of the headere */
  let token = header.split(" ")[1];
  /* Verification of the token */
  jwt.verify(token,process.env.TOKEN_SEED,(err,decoded)=>{
    if(err) return res.status(401).json({ok:false,err});
    /* Setting the propertie to send endpoint */
    req.userEmail = decoded.email;
    /* Continue with the endpoint */
    next();
  });
  console.log(token);
}

module.exports= {
  tokenVerification
}