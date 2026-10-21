export const EMAIL_TEMPLATE_VERSION = '1';

interface EmailTemplateDefinition {
  subject: string;
  title: string;
  paragraphs: string[];
  actionLabel?: string;
  requiresApprovedContent?: boolean;
}

const emailTemplates = {
  'account.verify': {
    subject: 'Verify your email',
    title: 'Verify your email address',
    paragraphs: ['Use the secure link below to verify the email address on your account.', 'If you did not create this account, you can ignore this message.'],
    actionLabel: 'Verify email'
  },
  'account.password_reset': {
    subject: 'Reset your password',
    title: 'Password reset requested',
    paragraphs: ['A password reset was requested for your account. Use the secure link below to choose a new password.', 'If you did not request a reset, secure your account from the sign-in page.'],
    actionLabel: 'Reset password'
  },
  'account.security_alert': {
    subject: 'A sign-in to your account',
    title: 'Account security notice',
    paragraphs: ['A sign-in or security-related change was recorded for your account.', 'If this was not you, visit your account security page and contact support.'],
    actionLabel: 'Review account security'
  },
  'tour.received': {
    subject: 'We received your tour request',
    title: 'Tour request received',
    paragraphs: ['We received your request to tour {{propertyAddress}}.', 'Your requested time is not confirmed until you receive a separate confirmation.'],
    actionLabel: 'View tour request'
  },
  'tour.confirmed': {
    subject: 'Your tour is confirmed',
    title: 'Tour confirmed',
    paragraphs: ['Your tour of {{propertyAddress}} is confirmed for {{tourDate}} at {{tourTime}}.', 'Review the appointment details and contact support if you need to make a change.'],
    actionLabel: 'View tour details'
  },
  'tour.reminder': {
    subject: 'Reminder: your home tour is coming up',
    title: 'Tour reminder',
    paragraphs: ['This is a reminder of your tour at {{propertyAddress}} on {{tourDate}} at {{tourTime}}.', 'Review your appointment details before you travel.'],
    actionLabel: 'View tour details'
  },
  'tour.changed': {
    subject: 'Your tour has been updated',
    title: 'Tour details changed',
    paragraphs: ['The tour details for {{propertyAddress}} have changed.', '{{eventSummary}}'],
    actionLabel: 'Review tour details'
  },
  'application.started': {
    subject: 'Your application is ready to continue',
    title: 'Continue your application',
    paragraphs: ['Your application for {{propertyAddress}} has been started.', 'Sign in to review saved information and complete any remaining sections.'],
    actionLabel: 'Continue application'
  },
  'application.verify_email': {
    subject: 'Verify your email to submit your application',
    title: 'Verify your email address',
    paragraphs: ['You started an application for {{propertyAddress}}.', 'Use the secure link below to verify this email address and submit the application. This link expires at {{expiresAt}}. If you did not start the application, you can ignore this email.'],
    actionLabel: 'Verify email and submit'
  },
  'application.submitted': {
    subject: 'We received your application',
    title: 'Application received',
    paragraphs: ['We received the application for {{propertyAddress}} on {{submittedAt}}.', 'Your application reference is {{applicationReference}}. Keep this reference for follow-up. The application is not a screening decision, lease offer, or reservation.'],
    actionLabel: 'Return to home search'
  },
  'application.staff_submitted': {
    subject: 'New application submitted: {{applicationReference}}',
    title: 'New application received',
    paragraphs: ['An application was submitted for {{propertyAddress}} by {{applicantName}}.', 'Reference: {{applicationReference}}. Submitted at {{submittedAt}}. Review the applicant details only through the authorized staff workflow.'],
    actionLabel: 'Open staff application queue'
  },
  'application.fee_receipt': {
    subject: 'Receipt for your application fee',
    title: 'Application fee receipt',
    paragraphs: ['We recorded an application-fee payment of {{amount}} on {{paymentDate}}.', 'Receipt reference: {{receiptReference}}.'],
    actionLabel: 'View receipt'
  },
  'application.action_required': {
    subject: 'Action needed to continue your application',
    title: 'Action required',
    paragraphs: ['A step is needed to continue your application for {{propertyAddress}}.', '{{eventSummary}}'],
    actionLabel: 'Review required action'
  },
  'application.information_requested': {
    subject: 'Additional information is needed',
    title: 'Information requested',
    paragraphs: ['Additional information is needed for your application for {{propertyAddress}}.', 'For your protection, review the request after signing in. Do not send identity or financial documents by reply email.'],
    actionLabel: 'Review request'
  },
  'application.status_updated': {
    subject: 'An update on your rental application',
    title: 'Application status updated',
    paragraphs: ['The status of your application for {{propertyAddress}} has changed.', 'Sign in to view the current status and any next steps.'],
    actionLabel: 'View application'
  },
  'application.conditional_approval': {
    subject: 'Next steps for your application',
    title: 'Application update',
    paragraphs: ['There is an update on your application for {{propertyAddress}}.', 'Sign in to review the written notice and any required next steps.'],
    actionLabel: 'Review application'
  },
  'application.adverse_action': {
    subject: 'An update on your application',
    title: 'Important application notice',
    paragraphs: ['{{approvedNoticeContent}}', 'This notice is provided with the required information for your application. Contact {{supportContact}} with questions.'],
    actionLabel: 'Review secure notice',
    requiresApprovedContent: true
  },
  'offer.issued': {
    subject: 'Your home offer and next steps',
    title: 'A home offer is available',
    paragraphs: ['An offer is available for {{propertyAddress}} until {{offerExpiresAt}}.', 'Review the exact property terms, amounts, deadlines, and conditions after signing in.'],
    actionLabel: 'Review offer'
  },
  'hold.expiry_reminder': {
    subject: 'Reminder: your home offer expires soon',
    title: 'Offer deadline reminder',
    paragraphs: ['The current offer for {{propertyAddress}} expires at {{offerExpiresAt}}.', 'Review the offer for its exact requirements. This reminder does not extend the deadline.'],
    actionLabel: 'Review offer'
  },
  'hold.payment_receipt': {
    subject: 'Receipt for your holding payment',
    title: 'Holding payment receipt',
    paragraphs: ['A holding payment of {{amount}} was confirmed for {{propertyAddress}} on {{paymentDate}}.', 'Receipt reference: {{receiptReference}}. Review the signed terms for how the funds are handled.'],
    actionLabel: 'View receipt'
  },
  'hold.expired': {
    subject: 'Your home offer has expired',
    title: 'Offer status update',
    paragraphs: ['The offer for {{propertyAddress}} is no longer active as of {{eventDate}}.', 'Sign in for current status and any payment or refund information.'],
    actionLabel: 'View account'
  },
  'hold.refund_updated': {
    subject: 'Update on your refund',
    title: 'Refund status updated',
    paragraphs: ['There is an update about the refund associated with {{propertyAddress}}.', '{{eventSummary}}', 'Refund reference: {{receiptReference}}.'],
    actionLabel: 'View payment activity'
  },
  'lease.ready_to_sign': {
    subject: 'Your lease is ready to review and sign',
    title: 'Lease documents ready',
    paragraphs: ['Lease documents for {{propertyAddress}} are ready for review.', 'Sign in to review the complete documents, attachments, and required signers.'],
    actionLabel: 'Review lease documents'
  },
  'lease.signature_reminder': {
    subject: 'Your lease signature is still needed',
    title: 'Lease signature reminder',
    paragraphs: ['A required signature is still outstanding for the lease for {{propertyAddress}}.', 'Sign in to review the document status and any applicable deadline.'],
    actionLabel: 'Review lease'
  },
  'lease.executed': {
    subject: 'Your lease is complete',
    title: 'Lease execution confirmed',
    paragraphs: ['The signing provider confirmed execution of the lease for {{propertyAddress}} on {{eventDate}}.', 'View the completed documents and next steps in your account.'],
    actionLabel: 'View completed lease'
  },
  'move_in.balance_due': {
    subject: 'Your move-in balance and payment options',
    title: 'Move-in balance available',
    paragraphs: ['Your move-in balance for {{propertyAddress}} is {{amount}} and is due {{dueDate}}.', 'Review the itemized charges and approved payment options after signing in.'],
    actionLabel: 'Review balance'
  },
  'move_in.payment_receipt': {
    subject: 'Receipt for your move-in payment',
    title: 'Move-in payment receipt',
    paragraphs: ['A move-in payment of {{amount}} was confirmed for {{propertyAddress}} on {{paymentDate}}.', 'Receipt reference: {{receiptReference}}.'],
    actionLabel: 'View receipt'
  },
  'move_in.preparation': {
    subject: 'Getting ready for move-in',
    title: 'Move-in preparation',
    paragraphs: ['Your planned move-in date for {{propertyAddress}} is {{moveInDate}}.', 'Sign in to review the approved move-in checklist, utility information, and appointment details.'],
    actionLabel: 'Review move-in checklist'
  },
  'resident.account_ready': {
    subject: 'Set up your resident account',
    title: 'Resident account ready',
    paragraphs: ['Your resident account for {{propertyAddress}} is ready to set up.', 'Use the secure link to verify your account and review available resident services.'],
    actionLabel: 'Set up account'
  },
  'maintenance.received': {
    subject: 'We received your maintenance request',
    title: 'Maintenance request received',
    paragraphs: ['We received maintenance request {{requestReference}} for {{propertyAddress}} on {{submittedAt}}.', 'Review the request status and appointment updates in your resident account.'],
    actionLabel: 'View request'
  },
  'maintenance.updated': {
    subject: 'Update on your maintenance request',
    title: 'Maintenance request updated',
    paragraphs: ['There is an update for maintenance request {{requestReference}} at {{propertyAddress}}.', '{{eventSummary}}'],
    actionLabel: 'View request'
  },
  'maintenance.emergency': {
    subject: 'Important: maintenance assistance',
    title: 'Emergency maintenance information',
    paragraphs: ['{{approvedEmergencyInstructions}}', 'If there is an immediate threat to life or safety, contact local emergency services.'],
    actionLabel: 'Open emergency instructions',
    requiresApprovedContent: true
  },
  'rent.reminder': {
    subject: 'Rent payment reminder',
    title: 'Upcoming rent payment',
    paragraphs: ['Rent of {{amount}} for {{propertyAddress}} is due {{dueDate}}.', 'Sign in to review your ledger and the available payment methods.'],
    actionLabel: 'Review rent account'
  },
  'payment.failed': {
    subject: 'There is an issue with your payment',
    title: 'Payment status update',
    paragraphs: ['A payment for {{propertyAddress}} could not be confirmed.', '{{eventSummary}} Review your payment activity after signing in.'],
    actionLabel: 'Review payment'
  },
  'payment.receipt': {
    subject: 'Rent payment receipt',
    title: 'Payment receipt',
    paragraphs: ['A payment of {{amount}} for {{propertyAddress}} was confirmed on {{paymentDate}}.', 'Receipt reference: {{receiptReference}}.'],
    actionLabel: 'View payment activity'
  },
  'renewal.offer': {
    subject: 'Your lease renewal offer',
    title: 'Renewal offer available',
    paragraphs: ['A renewal offer for {{propertyAddress}} is available until {{offerExpiresAt}}.', 'Sign in to review the full terms, rent, duration, notices, and response options.'],
    actionLabel: 'Review renewal offer'
  },
  'renewal.reminder': {
    subject: 'Reminder: respond to your renewal offer',
    title: 'Renewal response reminder',
    paragraphs: ['Your renewal offer for {{propertyAddress}} expires at {{offerExpiresAt}}.', 'Review the offer for exact terms and deadlines.'],
    actionLabel: 'Review renewal offer'
  },
  'move_out.instructions': {
    subject: 'Move-out steps and important dates',
    title: 'Move-out information',
    paragraphs: ['Move-out instructions are available for {{propertyAddress}}.', 'Sign in to review the applicable notice, inspection, key-return, forwarding-address, and deposit information.'],
    actionLabel: 'Review move-out information'
  },
  'deposit.disposition': {
    subject: 'Your security deposit disposition',
    title: 'Security deposit disposition',
    paragraphs: ['{{approvedDispositionContent}}', 'Review the itemized notice and applicable response information in your account. Contact {{supportContact}} with questions.'],
    actionLabel: 'Review disposition',
    requiresApprovedContent: true
  },
  'service.incident': {
    subject: 'Important update about your account or home',
    title: 'Important service update',
    paragraphs: ['{{approvedIncidentContent}}', 'Visit your account for current information and support options.'],
    actionLabel: 'View account',
    requiresApprovedContent: true
  }
} satisfies Record<string, EmailTemplateDefinition>;

export type EmailTemplateKey = keyof typeof emailTemplates;
export const EMAIL_TEMPLATES: Record<EmailTemplateKey, EmailTemplateDefinition> = emailTemplates;

export interface RenderedEmail {
  key: EmailTemplateKey;
  version: string;
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character] ?? character);
}

function interpolate(template: string, values: Record<string, string>, html: boolean): string {
  return template.replace(/{{([A-Za-z][A-Za-z0-9]*)}}/g, (_match, key: string) => {
    const value = values[key];
    if (value == null) throw new Error(`Missing email template value: ${key}`);
    return html ? escapeHtml(value) : value;
  });
}

function validatePortalUrl(portalUrl: string): void {
  if (portalUrl.startsWith('/')) return;
  let parsed: URL;
  try {
    parsed = new URL(portalUrl);
  } catch {
    throw new Error('portalUrl must be a relative path or HTTPS URL.');
  }
  if (parsed.protocol !== 'https:') throw new Error('portalUrl must use HTTPS.');
}

export function renderEmailTemplate(
  key: EmailTemplateKey,
  values: Record<string, string>,
  options: { approvedContent?: boolean } = {}
): RenderedEmail {
  const template = EMAIL_TEMPLATES[key];
  if (template.requiresApprovedContent && !options.approvedContent) {
    throw new Error(`Email template ${key} requires approved content before sending.`);
  }
  validatePortalUrl(values.portalUrl);

  const subject = interpolate(template.subject, values, false);
  const title = interpolate(template.title, values, true);
  const greeting = escapeHtml(values.firstName || 'there');
  const paragraphs = template.paragraphs.map((paragraph) => interpolate(paragraph, values, true));
  const action = template.actionLabel
    ? `<p><a href="${escapeHtml(values.portalUrl)}">${escapeHtml(template.actionLabel)}</a></p>`
    : '';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main><p>Hello ${greeting},</p><h1>${title}</h1>${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}${action}<p>For assistance, contact ${escapeHtml(values.supportContact || 'resident support')}.</p></main></body></html>`;
  const text = [
    `Hello ${values.firstName || 'there'},`,
    '',
    template.title,
    ...template.paragraphs.map((paragraph) => interpolate(paragraph, values, false)),
    template.actionLabel ? `${template.actionLabel}: ${values.portalUrl}` : '',
    `For assistance, contact ${values.supportContact || 'resident support'}.`
  ].filter(Boolean).join('\n');

  return { key, version: EMAIL_TEMPLATE_VERSION, subject, text, html };
}