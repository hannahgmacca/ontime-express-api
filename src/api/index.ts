import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import users from './user.routes';
import auth from './auth.routes';
import jobsites from './jobsite.routes';
import role from './role.routes';
import timeRecords from './time-record.routes';

// import timesheets from './time-sheet.routes';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/users', users);
router.use('/roles', role);
router.use('/auth', auth);
router.use('/jobsites', jobsites);
// router.use('/timesheet', timesheets);
router.use('/time-records', timeRecords);

export default router;
