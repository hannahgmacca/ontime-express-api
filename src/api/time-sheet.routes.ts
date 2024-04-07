// /* eslint-disable @typescript-eslint/indent */
// import express from 'express';
// import Timesheet from '../models/time-sheet.model';
// import { authMiddleware } from '../middlewares';
// import { UserDomain } from '../models/domain/user-domain.model';
// import TimeRecord, { ITimeRecord } from '../models/time-record.model';
// import { Types } from 'mongoose';
// import { calculateTotalHours } from '../utilities/calc';
// import { IUser } from '../models/user.model';

// const router = express.Router();

// // GET all time sheets
// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const user: UserDomain = new UserDomain(req.user);

//     // admins see all
//     if (user.getIsAdmin()) {
//       await Timesheet.find()
//         .populate<{
//           employee: IUser;
//           timeRecords: ITimeRecord[];
//         }>('employee timeRecords')
//         .then((timesheets) => {
//           timesheets.map((timesheet) => {
//             timesheet.totalHours = timesheet.timeRecords.reduce((accum, record) => accum + record.recordTotalHours, 0);
//           });

//           return res.json(timesheets);
//         });
//     }

//     // supervisors see timesheets with timerecords associated to a jobsite they are assigned to
//     if (user.getIsSupervisor()) {
//       await Timesheet.find({
//         'jobsite._id': { $in: user.jobsites },
//       })
//         .populate<{
//           employee: IUser;
//           timeRecords: ITimeRecord[];
//         }>('employee timeRecords')
//         .then((timesheets) => {
//           timesheets.map((timesheet) => {
//             timesheet.totalHours = timesheet.timeRecords.reduce((accum, record) => accum + record.recordTotalHours, 0);
//           });

//           return res.json(timesheets);
//         });
//     }

//     // only get timesheets for current user
//     if (user.getIsEmployee()) {
//       await Timesheet.find({
//         employee: user._id,
//       })
//         .populate<{
//           employee: IUser;
//           timeRecords: ITimeRecord[];
//         }>('employee timeRecords')
//         .then((timesheets) => {
//           timesheets.map((timesheet) => {
//             timesheet.totalHours = timesheet.timeRecords.reduce((accum, record) => accum + record.recordTotalHours, 0);
//           });

//           return res.json(timesheets);
//         });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // GET a specific time sheet by ID
// router.get('/:id', authMiddleware, async (req, res) => {
//   const { id } = req.params;

//   try {
//     const user: UserDomain = new UserDomain(req.user);

//     await Timesheet.findById(id)
//       .populate<{
//         employee: IUser;
//         timeRecords: ITimeRecord[];
//       }>('employee timeRecords')
//       .then((timesheet) => {
//         if (!timesheet) {
//           return res.status(404).json({ message: 'Time sheet not found' });
//         }

//         if (user.getUserTimesheetPermission(user._id)) {
//           timesheet.totalHours = timesheet.timeRecords.reduce((accum, record) => accum + record.recordTotalHours, 0);
//           return res.json(timesheet);
//         } else {
//           res.status(401).json({ message: 'Unauthorized' });
//         }
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // POST a new time sheet
// router.post('/', authMiddleware, async (req, res) => {
//   try {
//     const user: UserDomain = new UserDomain(req.user);
//     const { employee, date, timeRecords } = req.body;

//     if (user.getUserTimesheetPermission(employee)) {
//       const newTimeRecordIds: Types.ObjectId[] = [];

//       // add time records
//       await Promise.all(
//         timeRecords.map(async (record: ITimeRecord) => {
//           if (user.getUserTimeRecordPermission(record.jobsite._id, record.employee)) {
//             const recordTotalHours = calculateTotalHours(new Date(record.startTime), new Date(record.endTime));

//             const newTimeRecord = await TimeRecord.create({
//               employee: record.employee,
//               startTime: record.startTime,
//               endTime: record.endTime,
//               jobsite: record.jobsite,
//               isApproved: record.isApproved,
//               recordTotalHours,
//             } as ITimeRecord);

//             newTimeRecordIds.push(newTimeRecord._id);
//           } else {
//             res.status(401).json({ message: 'Unauthorized' });
//           }
//         }),
//       );

//       const newTimesheet = await Timesheet.create({
//         employee,
//         date,
//         timeRecords: newTimeRecordIds,
//       });

//       res.status(201).json(newTimesheet);
//     } else {
//       res.status(401).json({ message: 'Unauthorized' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // PATCH/update an existing time sheet by ID
// router.patch('/:id', authMiddleware, async (req, res) => {
//   const { id } = req.params;
//   const { timeRecords } = req.body;

//   try {
//     const user: UserDomain = new UserDomain(req.user);
//     const updatedTimesheet = await Timesheet.findById(id);

//     if (!updatedTimesheet) {
//       return res.status(404).json({ message: 'Time sheet not found' });
//     }

//     if (user.getUserTimesheetPermission(updatedTimesheet.employee)) {
//       const newTimeRecordIds: Types.ObjectId[] = [];

//       // add time records
//       await Promise.all(
//         timeRecords.map(async (record: ITimeRecord) => {
//           if (
//             user.getUserTimeRecordPermission(record.jobsite._id, record.employee)
//           ) {
//             const recordTotalHours = calculateTotalHours(new Date(record.startTime), new Date(record.endTime));

//             if (!record._id) {
//               const newTimeRecord = await TimeRecord.create({
//                 employee: record.employee,
//                 startTime: record.startTime,
//                 endTime: record.endTime,
//                 jobsite: record.jobsite,
//                 isApproved: record.isApproved,
//                 recordTotalHours,
//               });

//               newTimeRecordIds.push(newTimeRecord._id);
//             } else {
//               await TimeRecord.findByIdAndUpdate(record._id, {
//                 employee: record.employee,
//                 startTime: record.startTime,
//                 endTime: record.endTime,
//                 jobsite: record.jobsite,
//                 isApproved: record.isApproved,
//                 recordTotalHours,
//               });
//             }
//           } else {
//             res.status(401).json({ message: 'Unauthorized' });
//           }
//         }),
//       );

//       if (req.body.date) {
//         updatedTimesheet.date = req.body.date;
//       }

//       if (req.body.employee) {
//         updatedTimesheet.employee = req.body.employee;
//       }

//       updatedTimesheet.timeRecords.push(...newTimeRecordIds);
//       updatedTimesheet.save();

//       res.json(updatedTimesheet);
//     } else {
//       res.status(401).json({ message: 'Unauthorized' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // DELETE a time sheet by ID
// router.delete('/:id', authMiddleware, async (req, res) => {
//   const { id } = req.params;

//   try {
//     const user: UserDomain = new UserDomain(req.user);
//     const timesheet = await Timesheet.findById(id);

//     if (!timesheet) {
//       return res.status(404).json({ message: 'Time sheet not found' });
//     }

//     if (user.getUserTimesheetPermission(timesheet.employee)) {
//       timesheet?.deleteOne();
//       return res.json({ message: 'Time sheet deleted successfully' });
//     }

//     res.status(401).json({ message: 'Unauthorized' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// export default router;
