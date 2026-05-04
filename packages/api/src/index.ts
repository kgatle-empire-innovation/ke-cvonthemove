import express from 'express';
import { UserController } from './controllers/UserController';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const userController = new UserController();

app.get('/users', userController.getAllUsers);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
