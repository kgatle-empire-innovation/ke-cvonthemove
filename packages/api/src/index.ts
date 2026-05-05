import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { UserController } from './controllers/UserController';
import { WizardController } from './controllers/WizardController';
import { TemplateController } from './controllers/TemplateController';
import { AiController } from './controllers/AiController';
import { WebhookController } from './controllers/WebhookController';
import { validateSessionId } from './core/SessionMiddleware';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const userController = new UserController();
const wizardController = new WizardController();
const templateController = new TemplateController();
const aiController = new AiController();
const webhookController = new WebhookController();

const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.send('OK');
});

apiRouter.get('/users', userController.getAllUsers);

apiRouter.get('/templates', templateController.getAllTemplates);
apiRouter.get('/templates/:id', templateController.getTemplateById);

apiRouter.patch('/cv/wizard', validateSessionId, wizardController.updateWizardData);

apiRouter.post('/ai/refine', aiController.refineText);

// Webhook routes
apiRouter.get('/webhooks/whatsapp', webhookController.handleWhatsApp);
apiRouter.post('/webhooks/whatsapp', webhookController.handleWhatsApp);
apiRouter.get('/webhooks/messenger', webhookController.handleMessenger);
apiRouter.post('/webhooks/messenger', webhookController.handleMessenger);

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
