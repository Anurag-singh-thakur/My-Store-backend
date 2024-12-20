import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    pimage: String,
    username: {
        type: String,
        required: true
    }, 
    fname: {
        type: String,
        required: true
    },
    lname: String,
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    country: String,
    city: String,
    phone: Number,
    address: String,
    pincode: Number,
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart"
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
