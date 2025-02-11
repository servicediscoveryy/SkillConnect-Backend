import mongoose from "mongoose";

export const dbconnect = async () => {

    try {
        await mongoose.connect(process.env.MONGO_URI as string)
    } catch (error) {
        console.log(error)
    }
}