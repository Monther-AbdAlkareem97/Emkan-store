import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to MongoDB successfully");
  } catch (err) {
    console.error("faild connction wth MongoDB :", err);
    process.exit(1);
  }
};

export default connectDB;
