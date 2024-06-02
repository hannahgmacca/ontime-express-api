/* eslint-disable @typescript-eslint/indent */
import mongoose, { Model, Schema, Types } from 'mongoose';
import { IJobsite, jobsiteSchema } from './jobsite.model';
import { IUser } from './user.model';

export interface ITimeRecord {
  _id: Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
  jobsite: IJobsite;
  status: Status;
  employee: IUser;
  recordTotalHours: number;
  recordType: RecordType;
  notes: string;
  breakHours: number;
}

export enum Status {
  approved = 'approved',
  pending = 'pending',
  denied = 'denied',
}

export interface Break {
  startTime: Date;
  endTime: Date;
  totalBreakHours: number;
}

export enum RecordType {
  hoursWorked = 'hoursWorked',
  annualLeave = 'annualLeave',
  sickLeave = 'sickLeave'
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
  recordType: {
    type: String,
    enum: RecordType,
    default: RecordType.hoursWorked,
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  breakHours: Number,
  notes: String,
  recordTotalHours: Number,
});

const TimeRecord = mongoose.model<ITimeRecord, TimeRecordModel>('TimeRecord', timeRecordSchema);

export default TimeRecord;
