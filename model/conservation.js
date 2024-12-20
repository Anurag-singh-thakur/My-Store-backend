import mongoose from "mongoose";

const conservationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: {
        text: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        seen: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

export default mongoose.model("Conservation", conservationSchema);