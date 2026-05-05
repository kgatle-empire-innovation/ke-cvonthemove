import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  readonly features = [
    {
      icon: '✦',
      title: 'Build in Minutes',
      desc: 'Answer a few simple questions and your professional CV is ready — no design skills needed.',
    },
    {
      icon: '💬',
      title: 'Chat-Powered',
      desc: 'Build your CV via WhatsApp or Messenger. It meets you where you already are.',
    },
    {
      icon: '🤖',
      title: 'AI-Enhanced',
      desc: 'Our AI refines your summary and experience bullets to sound sharp and recruiter-ready.',
    },
    {
      icon: '📄',
      title: 'Beautiful Templates',
      desc: 'Choose from curated professional layouts. Download as PDF, ready to send.',
    },
  ];
}
