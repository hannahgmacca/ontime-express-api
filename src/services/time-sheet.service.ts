// import { ObjectId } from 'mongoose';
// import Timesheet, { ITimesheet } from '../models/time-sheet.model';

// export const findTimesheetsByJobsiteIds = async (
//   jobsiteIds: ObjectId[],
// ): Promise<ITimesheet[]> => {
//   const timesheets = await Timesheet.aggregate([
//     {
//       $match: {
//         'timeRecords.jobsite._id': { $in: jobsiteIds }, // Match the jobsite IDs within timeRecords
//       },
//     },
//   ]).exec();
//   return timesheets;
// };

// async function getTimeRecordsForSupervisor(
//   userId: ObjectId,
//   jobsiteIds: ObjectId[],
// ): Promise<ITimeRecord[]> {
//   // Query the timesheet collection to retrieve time records
//   const timeRecords: ITimeRecord[] = await Timesheet.aggregate([
//     {
//       $match: {
//         employee: userId,
//       },
//     },
//     {
//       $unwind: '$timeRecords',
//     },
//     {
//       $match: {
//         'timeRecords.jobsite._id': { $in: jobsiteIds },
//       },
//     },
//     {
//       $group: {
//         _id: '$_id',
//         timeRecords: { $push: '$timeRecords' },
//       },
//     },
//   ]);

//   return timeRecords;
// }
