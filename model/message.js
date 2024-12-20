import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conservation"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String
    },
    seen:{
        type: Boolean,
        default: false
    },
    pimage:{
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

export default mongoose.model("Message", messageSchema);