import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { UserController } from './controllers/UserController';
import { WizardController } from './controllers/WizardController';
import { TemplateController } from './controllers/TemplateController';
import { AiController } from './controllers/AiController';
import { WebhookController } from './controllers/WebhookController';
import { CvController } from './controllers/CvController';
import { validateSessionId } from './core/SessionMiddleware';
import { requireAuth } from './core/AuthGuard';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const userController = new UserController();
const wizardController = new WizardController();
const templateController = new TemplateController();
const aiController = new AiController();
const webhookController = new WebhookController();
const cvController = new CvController();

const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.send('OK');
});

// ── Auth ──────────────────────────────────────────────────────────────────────
apiRouter.post('/auth/register', userController.register);
apiRouter.post('/auth/login', userController.login);
/** Transfers anonymous wizard CVs to the authenticated account after login. */
apiRouter.post('/auth/promote-session', requireAuth, userController.promoteSession);

// ── User (admin-only for now) ─────────────────────────────────────────────────
apiRouter.get('/users', userController.getAllUsers);

// ── Templates ─────────────────────────────────────────────────────────────────
apiRouter.get('/templates', templateController.getAllTemplates);
apiRouter.get('/templates/:id', templateController.getTemplateById);

// ── Wizard (anonymous, session-based) ────────────────────────────────────────
apiRouter.patch('/cv/wizard', validateSessionId, wizardController.updateWizardData);

// ── CV Dashboard (authenticated) ──────────────────────────────────────────────
apiRouter.get('/cv', requireAuth, cvController.getMyCvs);
apiRouter.post('/cv', requireAuth, cvController.createCv);
apiRouter.get('/cv/:id', requireAuth, cvController.getCvById);
apiRouter.put('/cv/:id', requireAuth, cvController.updateCv);
apiRouter.delete('/cv/:id', requireAuth, cvController.deleteCv);
apiRouter.post('/cv/:id/duplicate', requireAuth, cvController.duplicateCv);

// ── AI ────────────────────────────────────────────────────────────────────────
apiRouter.post('/ai/refine', aiController.refineText);

// ── Webhooks ──────────────────────────────────────────────────────────────────
apiRouter.get('/webhooks/whatsapp', webhookController.handleWhatsApp);
apiRouter.post('/webhooks/whatsapp', webhookController.handleWhatsApp);
apiRouter.get('/webhooks/messenger', webhookController.handleMessenger);
apiRouter.post('/webhooks/messenger', webhookController.handleMessenger);

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
