/* eslint-disable @typescript-eslint/lines-between-class-members */
import mongoose, { Model, Schema, Types } from 'mongoose';
import { ICompany, companySchema } from './company.model';
import { IRole, roleSchema } from './role.model';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: ICompany;
  roles: IRole[];
  jobsites: Types.ObjectId[];
}

export type UserModel = Model<IUser>;

export const userSchema: Schema = new Schema<IUser, UserModel>({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  company: companySchema,
  roles: [roleSchema],
  jobsites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jobsite' }],
});

const User: UserModel = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
