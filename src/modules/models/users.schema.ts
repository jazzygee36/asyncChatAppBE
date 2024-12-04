import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;

  image: string;

  profileSetup: boolean;
}

interface IUserModel extends Model<IUser> {
  findAll(): Promise<IUser[]>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: false },

  image: { type: String, required: false },
 
  profileSetup: { type: Boolean, required: false },
});

userSchema.statics.findAll = function (): Promise<IUser[]> {
  return this.find({});
};

const User: IUserModel = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
