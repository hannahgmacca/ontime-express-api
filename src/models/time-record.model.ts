/* eslint-disable @typescript-eslint/indent */
import mongoose, { Model, Schema, Types } from 'mongoose';
import { IJobsite, jobsiteSchema } from './jobsite.model';

export interface ITimeRecord {
  _id: Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
  jobsite: IJobsite;
  status: Status;
  employee: Types.ObjectId;
  recordTotalHours: number;
}

export enum Status {
  approved = 'approved',
  pending = 'pending',
  cancelled = 'cancelled',
}

export type TimeRecordModel = Model<ITimeRecord>;

export const timeRecordSchema: Schema = new Schema<ITimeRecord, TimeRecordModel>({
  date: Date,
  startTime: Date,
  endTime: Date,
  jobsite: jobsiteSchema,
  status: {
    type: String,
    enum: Status,
    default: Status.pending,
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordTotalHours: Number,
});

const TimeRecord = mongoose.model<ITimeRecord, TimeRecordModel>('TimeRecord', timeRecordSchema);

export default TimeRecord;
