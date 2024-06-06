/* eslint-disable @typescript-eslint/indent */
import express from 'express';
import TimeRecord, { Break, RecordType, Status } from '../models/time-record.model';
import { UserDomain } from '../models/domain/user-domain.model';
import { authMiddleware } from '../middlewares';
import { calculateTotalHours } from '../utilities/calc';
import { IUser } from '../models/user.model';
import { getTimeRecordQuery, validateNewRecord } from '../utilities/query';
import Jobsite from '../models/jobsite.model';
import { stringify } from 'csv-stringify';
import { sendEmail } from '../services/email.service';
import { formatDateDdMmYyyy, getCurrentMonthStartDate, getCurrentWeekStartDate, getTimeIn24HourFormat, getTodaysDate } from '../utilities/date';

const router = express.Router();

// GET all time records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user: UserDomain = new UserDomain(req.user);
    const query = await getTimeRecordQuery(req, user);

    const timeRecords = await TimeRecord.find(query)
      .sort({ date: -1, startTime: 1, 'jobsite.name': 1 })
      .populate('employee');

    if (req.query.export) {
      const columns = [
        { key: 'Date', header: 'Date' },
        { key: 'StartTime', header: 'Start Time' },
        { key: 'EndTime', header: 'End Time' },
        { key: 'JobsiteName', header: 'Jobsite Name' },
        { key: 'EmployeeName', header: 'Employee Name' },
        { key: 'TotalHours', header: 'Total hours worked' },
        { key: 'BreakHours', header: 'Total Break hours' },
        { key: 'RecordType', header: 'Time entry type'},
        { key: 'Notes', header: 'Notes'}
      ];

      const csvData: object[] = timeRecords.map((record) => ({
        Date: formatDateDdMmYyyy(record.date),
        StartTime: getTimeIn24HourFormat(record.startTime),
        EndTime: getTimeIn24HourFormat(record.endTime),
        JobsiteName: record.jobsite.name.toString(),
        EmployeeName: record.employee.firstName.toString() + ' ' + record.employee.lastName.toString(), 
        TotalHours: record.recordTotalHours,
        BreakHours: record.breakHours,
        RecordType: record.recordType,
        Notes: record.notes
      }));

      stringify(csvData, { header: true, columns }, async (err: any, output: any) => {
        const testEmail: string = process.env.TEST_EMAIL || '';

        const result = { status: 400, message: 'Error generating CSV' };

        if (err) {
          console.error(err);
          return result;
        }

        const emailResponse = await sendEmail(
          testEmail,
          'OnTime App Date Export',
          'Attached is the CSV file containing your time records.',
          [
            {
              filename: 'time_records.csv',
              content: output,
            },
          ],
        );

        if (emailResponse.status === 200) {
          return res.status(200).json({ message: 'CSV emailed successfully' });
        } else {
          return res.status(400).json({ message: 'CSV email failed' });
        }
      });
    } else {
      return res.json(timeRecords);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET a specific time record by ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user: UserDomain = new UserDomain(req.user);

    await TimeRecord.findById(id)
      .populate<{
        employee: IUser;
      }>('employee jobsite')
      .then((timeRecord) => {
        if (!timeRecord) {
          return res.status(404).json({ message: 'Time record not found' });
        }

        if (user.getUserTimeRecordPermission(timeRecord.jobsite._id, timeRecord.employee._id)) {
          return res.json(timeRecord);
        } else {
          res.status(403).json({ message: 'Unauthorized' });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST a new time record
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user: UserDomain = new UserDomain(req.user);
    const { employee, startTime, endTime, jobsite, status, date, breakHours, notes, recordType } = req.body;

    const errorMessages = await validateNewRecord(req);
    if (errorMessages.length > 0) {
      return res.status(400).json({ message: errorMessages.map((e) => e) });
    }

    if (user.getUserTimeRecordPermission(jobsite._id, employee)) {
      let recordTotalHours = calculateTotalHours(new Date(startTime), new Date(endTime));

      const validatedJobsite = await Jobsite.findById(jobsite._id);

      if (breakHours && breakHours > 0) {
          recordTotalHours -= breakHours;
      }

      let validatedStatus = Status[status as Status];

      if (recordType == RecordType.annualLeave || recordType == RecordType.sickLeave) {
        validatedStatus = Status.approved;
      } else {
        validatedStatus = Status.pending;
      }

      let validatedRecordType = RecordType[recordType as RecordType] || RecordType.hoursWorked;

      const newTimeRecord = await TimeRecord.create({
        employee,
        date,
        startTime,
        endTime,
        jobsite: validatedJobsite,
        status: validatedStatus,
        recordType: validatedRecordType,
        recordTotalHours,
        notes,
        breakHours: breakHours
      });

      return res.status(201).json(newTimeRecord);
    }

    res.status(403).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', stack: error });
  }
});

// PATCH/update an existing time record by ID
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, jobsite, status, date, breakHours, notes, recordType } = req.body;

  try {
    const user: UserDomain = new UserDomain(req.user);

    const validatedJobsite = await Jobsite.findById(jobsite._id);
    if (!validatedJobsite) return res.status(400).json({ message: 'Invalid jobsite' });

    await TimeRecord.findById(id)
      .populate<{
        employee: IUser;
      }>('employee jobsite')
      .then((timeRecord) => {
        if (!timeRecord) {
          return res.status(404).json({ message: 'Time record not found' });
        }

        if (user.getUserTimeRecordPermission(timeRecord.jobsite._id, timeRecord.employee._id)) {
          if (startTime && endTime) {
            timeRecord.date = date;
            timeRecord.startTime = startTime;
            timeRecord.endTime = endTime;
            timeRecord.recordTotalHours = calculateTotalHours(new Date(startTime), new Date(endTime)) - timeRecord.breakHours;
          }

          if (jobsite) {
            timeRecord.jobsite = validatedJobsite;
          }

          if (status) {
            if (!Status[status as Status]) return res.status(400).json({ message: 'Invalid status' });
            timeRecord.status = Status[status as Status];
          }
        
          if (recordType) {
            if (!RecordType[recordType as RecordType]) return res.status(400).json({ message: 'Invalid record type' });
            timeRecord.recordType = RecordType[recordType as RecordType];
          }

          if (breakHours && breakHours > 0) {
            timeRecord.recordTotalHours -= breakHours;
            timeRecord.breakHours = breakHours;
          }

          if (notes != null) {
            timeRecord.notes = notes;
          }
  
          timeRecord.save();
          return res.json(timeRecord);
        } else {
          res.status(403).json({ message: 'Unauthorized' });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a time record by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const timeRecord = await TimeRecord.findById(id).populate('employee');
    const user: UserDomain = new UserDomain(req.user);

    if (!timeRecord) {
      return res.status(404).json({ message: 'Time record not found' });
    }

    if (user.getUserTimeRecordPermission(timeRecord.jobsite._id, timeRecord.employee._id)) {
      await TimeRecord.findByIdAndDelete(id);
      return res.json({ message: 'Time record deleted successfully' });
    }

    res.status(403).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET all time records total
router.get('/stats/totals', authMiddleware, async (req, res) => {
  try {
    const user: UserDomain = new UserDomain(req.user);

    const query = await getTimeRecordQuery(req, user);

    const timeRecords = await TimeRecord.find(query);

    let totalHours = timeRecords.reduce((a,b) => a + b.recordTotalHours, 0)

    return res.json({totalHours});
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET all time records total
router.get('/stats/employee/:id', authMiddleware, async (req, res) => {
  try {
    const user: UserDomain = new UserDomain(req.user);
    console.log('we')

    const { id } = req.params;

    const todaysDate = getTodaysDate();
    console.log(todaysDate)
    const currentWeekStartDate = getCurrentWeekStartDate();
    const monthStartDate = getCurrentMonthStartDate();

    const timeRecords = await TimeRecord.find({employee: id, recordType: RecordType.hoursWorked});

    let totalHoursToday = 0;
    let totalHoursWeek = 0;
    let totalHoursMonth = 0;
    let totalHoursInception = 0;

    timeRecords.map(record => {
      if (record.date >= todaysDate) {
        totalHoursToday += record.recordTotalHours;
      }

      if (record.date >= currentWeekStartDate) {
        totalHoursWeek += record.recordTotalHours;
      }

      if (record.date >= monthStartDate) {
        totalHoursMonth += record.recordTotalHours;
      }

      totalHoursInception += record.recordTotalHours;

    })

   
    return res.json({ 
      day: totalHoursToday.toFixed(2),
      week: totalHoursWeek.toFixed(2),
      month: totalHoursMonth.toFixed(2),
      sinceInception: totalHoursInception.toFixed(2)
     });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
