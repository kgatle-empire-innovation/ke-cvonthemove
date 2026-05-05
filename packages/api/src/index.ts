import express from 'express';
import { UserController } from './controllers/UserController';
import { WizardController } from './controllers/WizardController';
import { TemplateController } from './controllers/TemplateController';
import { validateSessionId } from './core/SessionMiddleware';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const userController = new UserController();
const wizardController = new WizardController();
const templateController = new TemplateController();

app.get('/users', userController.getAllUsers);

app.get('/templates', templateController.getAllTemplates);
app.get('/templates/:id', templateController.getTemplateById);

app.patch('/cv/wizard', validateSessionId, wizardController.updateWizardData);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
