import mongoose from "mongoose";
mongoose.connect(
  "mongodb+srv://vivek1_4:vivek9912@cluster0.0ymfu.mongodb.net/?retryWrites=true&w=majority"
);

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required:true,
    unique: true,
  },
  watchlist: {
    type: [String],
    default: [],
  },
  emailWatchList: [
    {
      coinName: { type: String, required: true },
      mailSent: { type: Boolean, default: false },
    },
  ],
  password: {
    type: String,
    required: true,
  },
});
const User = mongoose.model("trackingCrytpo", userSchema);

export default User;
