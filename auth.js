import jwt from "jsonwebtoken";
import User from "./models.js";
const auth = async (req,res,next)=>{
   const userToken = req.headers["authorization"];
   if(userToken){
     const tokenUser = jwt.verify(userToken,"samplekey");
     const user = await User.findOne({userId:tokenUser.userId});
     if(!user){
        res.sendStatus(403)
     }
     req.user = user;
     next();
   }else{
    console.log("invalid token")
    res.sendStatus(404)
   }
}

export default auth;