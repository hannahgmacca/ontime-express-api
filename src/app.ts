import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';

// Set the default time zone to 'Australia/Sydney' (NSW time zone)
process.env.TZ = 'Australia/Sydney';

require('dotenv').config();

// Set up mongoose connection
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connect to MongoDB.');
  })
  .catch((err: any) => {
    console.error('Connection error', err);
    process.exit();
  });

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'OnTime Express API',
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
