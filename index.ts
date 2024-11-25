import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
dotenv.config();
import usersRouters from './src/modules/routers/authRouter';

const app = express();
const Port = process.env.PORT || 2000;

// MongoDB connection
const uri = process.env.DATABASE_URL as string;
mongoose
  .connect(uri)
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((error) => {
    console.error('Error connecting to DB:', error);
  });

// MiddleWare
app.use(express());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.use('/api', usersRouters);

// app.listen(Port, () => {
//   console.log(`Listen on Port ${Port}`);
// });

export default app;
