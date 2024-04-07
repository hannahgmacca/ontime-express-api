import mongoose, { Model, Schema, Types } from 'mongoose';

export interface IJobsite {
  _id: Types.ObjectId;
  name: String;
  city: String;
}

export type JobsiteModel = Model<IJobsite>;

export const jobsiteSchema: Schema = new Schema<IJobsite, JobsiteModel>({
  name: String,
  city: String,
});

const Jobsite: JobsiteModel = mongoose.model<IJobsite, JobsiteModel>('Jobsite', jobsiteSchema);

export default Jobsite;
