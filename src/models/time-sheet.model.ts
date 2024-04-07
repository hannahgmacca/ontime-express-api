// import mongoose, { Model, Schema, Types } from 'mongoose';

// export interface ITimesheet {
//   _id: Types.ObjectId;
//   employee: Types.ObjectId;
//   date: Date;
//   timeRecords: Array<Types.ObjectId>;
//   totalHours: number;
// }

// export type TimesheetModel = Model<ITimesheet>;

// const timesheetSchema: Schema = new Schema<ITimesheet, TimesheetModel>({
//   employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   date: Date,
//   timeRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TimeRecord' }],
//   totalHours: Number,
// });

// const Timesheet = mongoose.model<ITimesheet, TimesheetModel>('Timesheet', timesheetSchema);

// export default Timesheet;
