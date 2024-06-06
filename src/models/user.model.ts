/* eslint-disable @typescript-eslint/lines-between-class-members */
import mongoose, { Model, Schema, Types } from 'mongoose';
import { IRole, roleSchema } from './role.model';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: IRole[];
  jobsites: Types.ObjectId[];
  resetCode: string | null;
  isActive: boolean
}

export type UserModel = Model<IUser>;

export const userSchema: Schema = new Schema<IUser, UserModel>({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  roles: [roleSchema],
  jobsites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jobsite' }],
  resetCode: String,
  isActive: {type: Boolean, default: true}
});

const User: UserModel = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
