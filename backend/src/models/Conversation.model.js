import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        // Sử dụng mongoose.Schema.Types.ObjectId
        _id: mongoose.Schema.Types.ObjectId, 
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        lastMessage: {
            text: String,
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: Date
        },  
    },
    { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);