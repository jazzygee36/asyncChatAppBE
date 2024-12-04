import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IMessages extends Document {
  sender: mongoose.Schema.Types.ObjectId;
  recipient: mongoose.Schema.Types.ObjectId;
  messageType: string;
  content?: string;
  fileUrl?: string;
  timestamp: Date;
}

interface IMessagesModel extends Model<IMessages> {
  findAll(): Promise<IMessages[]>;
}

const messagesSchema = new Schema<IMessages>({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Users',
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Users',
  },
  messageType: { type: String, enum: ['text', 'file'], required: true },
  content: {
    type: String,
    required: function (this: IMessages) {
      return this.messageType === 'text';
    },
  },
  fileUrl: {
    type: String,
    required: function (this: IMessages) {
      return this.messageType === 'file';
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Static method to find all messages
messagesSchema.statics.findAll = function (): Promise<IMessages[]> {
  return this.find({});
};

// Define the model
const Messages: IMessagesModel = mongoose.model<IMessages, IMessagesModel>(
  'Messages',
  messagesSchema
);

export default Messages;
