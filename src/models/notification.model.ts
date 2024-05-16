import mongoose, { Model, Schema, Types } from 'mongoose';

export interface INotifciation {
  _id: Types.ObjectId;
  name: String;
  city: String;
}

export type NotificationModel = Model<INotifciation>;

export const notificationSchema: Schema = new Schema<INotifciation, NotificationModel>({
  name: String,
  city: String,
});

const Jobsite: NotificationModel = mongoose.model<INotifciation, NotificationModel>('Jobsite', notificationSchema);

export default Jobsite;
