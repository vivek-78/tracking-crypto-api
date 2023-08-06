import jwt from "jsonwebtoken";
import User from "./models.js";
const auth = async (req,res,next)=>{
   const userToken = req.body.headers["authorization"];
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
    res.status(404).json({ message: "invalid token" });
   }
}

export default auth;