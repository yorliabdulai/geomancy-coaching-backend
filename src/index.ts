import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from './middlewares/passport';
import userController from './controllers/userController';
import contentController from './controllers/contentController';
import appointmentController from './controllers/appointmentController';
import subscriptionController from './controllers/subscriptionController';
import ecommerceController from './controllers/ecommerceController';

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());

app.use('/api/users', userController);
app.use('/api/content', contentController);
app.use('/api/appointments', appointmentController);
app.use('/api/subscriptions', subscriptionController);
app.use('/api/ecommerce', ecommerceController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
