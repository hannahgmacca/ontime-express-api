/* eslint-disable @typescript-eslint/indent */
import express from 'express';
import TimeRecord, { Status } from '../models/time-record.model';
import { UserDomain } from '../models/domain/user-domain.model';
import { authMiddleware } from '../middlewares';
import { calculateTotalHours } from '../utilities/calc';
import { IUser } from '../models/user.model';
import { getTimeRecordQuery, validateNewRecord } from '../utilities/query';
import Jobsite from '../models/jobsite.model';

const router = express.Router();

// GET all time records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user: UserDomain = new UserDomain(req.user);
    const query = await getTimeRecordQuery(req, user);

    const timeRecords = await TimeRecord.find(query).sort({ date: -1, startTime: 1, 'jobsite.name': 1 }).populate('employee');

    return res.json(timeRecords);
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
        // no time record found
        if (!timeRecord) {
          return res.status(404).json({ message: 'Time record not found' });
        }

        if (user.getUserTimeRecordPermission(timeRecord.jobsite._id, timeRecord.employee._id)) {
          return res.json(timeRecord);
        } else {
          res.status(401).json({ message: 'Unauthorized' });
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
    const { employee, startTime, endTime, jobsite, status, date } = req.body;

    const errorMessages = await validateNewRecord(req);
    if (errorMessages.length > 0) {
      return res.status(400).json({ message: errorMessages.map((e) => e) });
    }

    if (user.getUserTimeRecordPermission(jobsite._id, employee)) {
      const recordTotalHours = calculateTotalHours(new Date(startTime), new Date(endTime));

      const validatedJobsite = await Jobsite.findById(jobsite._id);
      
      let validatedStatus = Status[status as Status];
      if (!Status[status as Status]) validatedStatus = Status.pending;

      const newTimeRecord = await TimeRecord.create({
        employee,
        date,
        startTime,
        endTime,
        jobsite: validatedJobsite,
        status: validatedStatus,
        recordTotalHours,
      });

      return res.status(201).json(newTimeRecord);
    }

    res.status(401).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', stack: error });
  }
});

// PATCH/update an existing time record by ID
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, jobsite, status, date } = req.body;

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
            timeRecord.recordTotalHours = calculateTotalHours(new Date(startTime), new Date(endTime));
          }

          if (jobsite) {
            timeRecord.jobsite = validatedJobsite;
          }

          if (status) { 
            if (!Status[status as Status]) return res.status(400).json({ message: 'Invalid status' });
            timeRecord.status = Status[status as Status];
          }

          timeRecord.save();
          return res.json(timeRecord);
        } else {
          res.status(401).json({ message: 'Unauthorized' });
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

    res.status(401).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
