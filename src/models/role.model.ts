import mongoose, { Model, ObjectId, Schema } from 'mongoose';

export interface IRole {
  _id: ObjectId;
  name: String;
}

export type RoleModel = Model<IRole>;

export const roleSchema: Schema = new Schema<IRole, RoleModel>({
  name: String,
});

const Role: RoleModel = mongoose.model<IRole, RoleModel>('Role', roleSchema);

export default Role;
