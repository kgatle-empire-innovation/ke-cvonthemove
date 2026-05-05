import { Request, Response } from 'express';
import { ConversationService } from '../services/ConversationService';

export class WebhookController {
  private conversationService: ConversationService;

  constructor() {
    this.conversationService = new ConversationService();
  }

  /**
   * Handles WhatsApp Cloud API webhooks
   */
  public handleWhatsApp = async (req: Request, res: Response) => {
    // Verification check for webhook setup
    if (req.query['hub.mode'] === 'subscribe') {
      return res.send(req.query['hub.challenge']);
    }

    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const message = change.value.messages?.[0];
            if (message && message.type === 'text') {
              const from = message.from; // Phone number
              const text = message.text.body;
              const sessionId = `whatsapp:${from}`;

              console.log(`Received WhatsApp message from ${from}: ${text}`);
              
              const response = await this.conversationService.processMessage(sessionId, text);
              
              // In a real app, you would use the WhatsApp Cloud API to send the response back
              console.log(`Sending WhatsApp response to ${from}: ${response}`);
            }
          }
        }
      }
      return res.sendStatus(200);
    }

    res.sendStatus(404);
  };

  /**
   * Handles Messenger (Meta Graph API) webhooks
   */
  public handleMessenger = async (req: Request, res: Response) => {
    // Verification check for webhook setup
    if (req.query['hub.mode'] === 'subscribe') {
      return res.send(req.query['hub.challenge']);
    }

    const body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const event of entry.messaging) {
          if (event.message && event.message.text) {
            const senderId = event.sender.id;
            const text = event.message.text;
            const sessionId = `messenger:${senderId}`;

            console.log(`Received Messenger message from ${senderId}: ${text}`);

            const response = await this.conversationService.processMessage(sessionId, text);

            // In a real app, you would use the Meta Send API to send the response back
            console.log(`Sending Messenger response to ${senderId}: ${response}`);
          }
        }
      }
      return res.sendStatus(200);
    }

    res.sendStatus(404);
  };
}
