/* eslint-disable @typescript-eslint/indent */
import mongoose, { Model, Schema, Types } from 'mongoose';
import { IJobsite, jobsiteSchema } from './jobsite.model';

export interface ITimeRecord {
  _id: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  jobsite: IJobsite;
  isApproved: boolean;
  employee: Types.ObjectId;
  recordTotalHours: number;
}

export type TimeRecordModel = Model<ITimeRecord>;

export const timeRecordSchema: Schema = new Schema<ITimeRecord, TimeRecordModel>({
  startTime: Date,
  endTime: Date,
  jobsite: jobsiteSchema,
  isApproved: Boolean,
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordTotalHours: Number,
});

const TimeRecord = mongoose.model<ITimeRecord, TimeRecordModel>('TimeRecord', timeRecordSchema);

export default TimeRecord;
