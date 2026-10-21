const TEMPLATE_VERSION = '1';
const TEMPLATE_CATALOG = {
  'account.verify': ['Verify your email', 'Verify your email address', ['Use the secure link below to verify the email address on your account.', 'If you did not create this account, you can ignore this message.'], 'Verify email'],
  'account.password_reset': ['Reset your password', 'Password reset requested', ['A password reset was requested for your account. Use the secure link below to choose a new password.', 'If you did not request a reset, secure your account from the sign-in page.'], 'Reset password'],
  'account.security_alert': ['A sign-in to your account', 'Account security notice', ['A sign-in or security-related change was recorded for your account.', 'If this was not you, visit your account security page and contact support.'], 'Review account security'],
  'tour.received': ['We received your tour request', 'Tour request received', ['We received your request to tour {{propertyAddress}}.', 'Your requested time is not confirmed until you receive a separate confirmation.'], 'View tour request'],
  'tour.confirmed': ['Your tour is confirmed', 'Tour confirmed', ['Your tour of {{propertyAddress}} is confirmed for {{tourDate}} at {{tourTime}}.', 'Review the appointment details and contact support if you need to make a change.'], 'View tour details'],
  'tour.reminder': ['Reminder: your home tour is coming up', 'Tour reminder', ['This is a reminder of your tour at {{propertyAddress}} on {{tourDate}} at {{tourTime}}.', 'Review your appointment details before you travel.'], 'View tour details'],
  'tour.changed': ['Your tour has been updated', 'Tour details changed', ['The tour details for {{propertyAddress}} have changed.', '{{eventSummary}}'], 'Review tour details'],
  'application.started': ['Your application is ready to continue', 'Continue your application', ['Your application for {{propertyAddress}} has been started.', 'Sign in to review saved information and complete any remaining sections.'], 'Continue application'],
  'application.verify_email': ['Verify your email to submit your application', 'Verify your email address', ['You started an application for {{propertyAddress}}.', 'Use the secure link below to verify this email address and submit the application. This link expires at {{expiresAt}}. If you did not start the application, you can ignore this email.'], 'Verify email and submit'],
  'application.submitted': ['We received your application', 'Application received', ['We received the application for {{propertyAddress}} on {{submittedAt}}.', 'Your application reference is {{applicationReference}}. Keep this reference for follow-up. The application is not a screening decision, lease offer, or reservation.'], 'Return to home search'],
  'application.staff_submitted': ['New application submitted: {{applicationReference}}', 'New application received', ['An application was submitted for {{propertyAddress}} by {{applicantName}}.', 'Reference: {{applicationReference}}. Submitted at {{submittedAt}}. Review the applicant details only through the authorized staff workflow.'], 'Open staff application queue'],
  'application.fee_receipt': ['Receipt for your application fee', 'Application fee receipt', ['We recorded an application-fee payment of {{amount}} on {{paymentDate}}.', 'Receipt reference: {{receiptReference}}.'], 'View receipt'],
  'application.action_required': ['Action needed to continue your application', 'Action required', ['A step is needed to continue your application for {{propertyAddress}}.', '{{eventSummary}}'], 'Review required action'],
  'application.information_requested': ['Additional information is needed', 'Information requested', ['Additional information is needed for your application for {{propertyAddress}}.', 'For your protection, review the request after signing in. Do not send identity or financial documents by reply email.'], 'Review request'],
  'application.status_updated': ['An update on your rental application', 'Application status updated', ['The status of your application for {{propertyAddress}} has changed.', 'Sign in to view the current status and any next steps.'], 'View application'],
  'application.conditional_approval': ['Next steps for your application', 'Application update', ['There is an update on your application for {{propertyAddress}}.', 'Sign in to review the written notice and any required next steps.'], 'Review application'],
  'application.adverse_action': ['An update on your application', 'Important application notice', ['{{approvedNoticeContent}}', 'This notice is provided with the required information for your application. Contact {{supportContact}} with questions.'], 'Review secure notice', true],
  'offer.issued': ['Your home offer and next steps', 'A home offer is available', ['An offer is available for {{propertyAddress}} until {{offerExpiresAt}}.', 'Review the exact property terms, amounts, deadlines, and conditions after signing in.'], 'Review offer'],
  'hold.expiry_reminder': ['Reminder: your home offer expires soon', 'Offer deadline reminder', ['The current offer for {{propertyAddress}} expires at {{offerExpiresAt}}.', 'Review the offer for its exact requirements. This reminder does not extend the deadline.'], 'Review offer'],
  'hold.payment_receipt': ['Receipt for your holding payment', 'Holding payment receipt', ['A holding payment of {{amount}} was confirmed for {{propertyAddress}} on {{paymentDate}}.', 'Receipt reference: {{receiptReference}}. Review the signed terms for how the funds are handled.'], 'View receipt'],
  'hold.expired': ['Your home offer has expired', 'Offer status update', ['The offer for {{propertyAddress}} is no longer active as of {{eventDate}}.', 'Sign in for current status and any payment or refund information.'], 'View account'],
  'hold.refund_updated': ['Update on your refund', 'Refund status updated', ['There is an update about the refund associated with {{propertyAddress}}.', '{{eventSummary}}', 'Refund reference: {{receiptReference}}.'], 'View payment activity'],
  'lease.ready_to_sign': ['Your lease is ready to review and sign', 'Lease documents ready', ['Lease documents for {{propertyAddress}} are ready for review.', 'Sign in to review the complete documents, attachments, and required signers.'], 'Review lease documents'],
  'lease.signature_reminder': ['Your lease signature is still needed', 'Lease signature reminder', ['A required signature is still outstanding for the lease for {{propertyAddress}}.', 'Sign in to review the document status and any applicable deadline.'], 'Review lease'],
  'lease.executed': ['Your lease is complete', 'Lease execution confirmed', ['The signing provider confirmed execution of the lease for {{propertyAddress}} on {{eventDate}}.', 'View the completed documents and next steps in your account.'], 'View completed lease'],
  'move_in.balance_due': ['Your move-in balance and payment options', 'Move-in balance available', ['Your move-in balance for {{propertyAddress}} is {{amount}} and is due {{dueDate}}.', 'Review the itemized charges and approved payment options after signing in.'], 'Review balance'],
  'move_in.payment_receipt': ['Receipt for your move-in payment', 'Move-in payment receipt', ['A move-in payment of {{amount}} was confirmed for {{propertyAddress}} on {{paymentDate}}.', 'Receipt reference: {{receiptReference}}.'], 'View receipt'],
  'move_in.preparation': ['Getting ready for move-in', 'Move-in preparation', ['Your planned move-in date for {{propertyAddress}} is {{moveInDate}}.', 'Sign in to review the approved move-in checklist, utility information, and appointment details.'], 'Review move-in checklist'],
  'resident.account_ready': ['Set up your resident account', 'Resident account ready', ['Your resident account for {{propertyAddress}} is ready to set up.', 'Use the secure link to verify your account and review available resident services.'], 'Set up account'],
  'maintenance.received': ['We received your maintenance request', 'Maintenance request received', ['We received maintenance request {{requestReference}} for {{propertyAddress}} on {{submittedAt}}.', 'Review the request status and appointment updates in your resident account.'], 'View request'],
  'maintenance.updated': ['Update on your maintenance request', 'Maintenance request updated', ['There is an update for maintenance request {{requestReference}} at {{propertyAddress}}.', '{{eventSummary}}'], 'View request'],
  'maintenance.emergency': ['Important: maintenance assistance', 'Emergency maintenance information', ['{{approvedEmergencyInstructions}}', 'If there is an immediate threat to life or safety, contact local emergency services.'], 'Open emergency instructions', true],
  'rent.reminder': ['Rent payment reminder', 'Upcoming rent payment', ['Rent of {{amount}} for {{propertyAddress}} is due {{dueDate}}.', 'Sign in to review your ledger and the available payment methods.'], 'Review rent account'],
  'payment.failed': ['There is an issue with your payment', 'Payment status update', ['A payment for {{propertyAddress}} could not be confirmed.', '{{eventSummary}} Review your payment activity after signing in.'], 'Review payment'],
  'payment.receipt': ['Rent payment receipt', 'Payment receipt', ['A payment of {{amount}} for {{propertyAddress}} was confirmed on {{paymentDate}}.', 'Receipt reference: {{receiptReference}}.'], 'View payment activity'],
  'renewal.offer': ['Your lease renewal offer', 'Renewal offer available', ['A renewal offer for {{propertyAddress}} is available until {{offerExpiresAt}}.', 'Sign in to review the full terms, rent, duration, notices, and response options.'], 'Review renewal offer'],
  'renewal.reminder': ['Reminder: respond to your renewal offer', 'Renewal response reminder', ['Your renewal offer for {{propertyAddress}} expires at {{offerExpiresAt}}.', 'Review the offer for exact terms and deadlines.'], 'Review renewal offer'],
  'move_out.instructions': ['Move-out steps and important dates', 'Move-out information', ['Move-out instructions are available for {{propertyAddress}}.', 'Sign in to review the applicable notice, inspection, key-return, forwarding-address, and deposit information.'], 'Review move-out information'],
  'deposit.disposition': ['Your security deposit disposition', 'Security deposit disposition', ['{{approvedDispositionContent}}', 'Review the itemized notice and applicable response information in your account. Contact {{supportContact}} with questions.'], 'Review disposition', true],
  'service.incident': ['Important update about your account or home', 'Important service update', ['{{approvedIncidentContent}}', 'Visit your account for current information and support options.'], 'View account', true]
};

function jsonOutput(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character];
  });
}

function interpolate(value, values, htmlMode) {
  return String(value).replace(/{{([A-Za-z][A-Za-z0-9]*)}}/g, function (_match, key) {
    if (values[key] === undefined || values[key] === null) throw new Error('Missing template value: ' + key);
    return htmlMode ? escapeHtml(values[key]) : String(values[key]);
  });
}

function validatePortalUrl(value) {
  if (typeof value !== 'string' || !value) throw new Error('Portal URL required.');
  if (value.charAt(0) === '/' && value.indexOf('//') !== 0) return;
  if (!/^https:\/\//i.test(value)) throw new Error('Portal URL must use HTTPS.');
}

function renderTemplate(key, values, approvedContent) {
  var template = TEMPLATE_CATALOG[key];
  if (!template) throw new Error('Unknown email template.');
  if (template[4] && approvedContent !== true) throw new Error('Approved content required for this template.');
  validatePortalUrl(values.portalUrl);
  var subject = interpolate(template[0], values, false);
  if (/[\r\n]/.test(subject)) throw new Error('Invalid email subject.');
  var title = interpolate(template[1], values, true);
  var paragraphs = template[2].map(function (paragraph) { return interpolate(paragraph, values, true); });
  var greeting = escapeHtml(values.firstName || 'there');
  var action = template[3] ? '<p><a href="' + escapeHtml(values.portalUrl) + '">' + escapeHtml(template[3]) + '</a></p>' : '';
  var support = escapeHtml(values.supportContact || 'resident support');
  var htmlBody = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial,sans-serif;color:#232323;line-height:1.5}main{max-width:600px;margin:24px auto;padding:24px}h1{font-size:22px}a{color:#168241}</style></head><body><main><p>Hello ' + greeting + ',</p><h1>' + title + '</h1>' + paragraphs.map(function (paragraph) { return '<p>' + paragraph + '</p>'; }).join('') + action + '<p>For assistance, contact ' + support + '.</p></main></body></html>';
  var textBody = ['Hello ' + (values.firstName || 'there') + ',', '', template[1]]
    .concat(template[2].map(function (paragraph) { return interpolate(paragraph, values, false); }))
    .concat(template[3] ? [template[3] + ': ' + values.portalUrl] : [])
    .concat(['For assistance, contact ' + (values.supportContact || 'resident support') + '.'])
    .join('\n');
  return { subject: subject, htmlBody: htmlBody, textBody: textBody };
}

function validEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function doPost(event) {
  var lock = LockService.getScriptLock();
  try {
    if (!event || !event.postData || !event.postData.contents || event.postData.contents.length > 32768) return jsonOutput({ success: false, error: 'invalid_request' });
    var request = JSON.parse(event.postData.contents);
    var properties = PropertiesService.getScriptProperties();
    var expectedSecret = properties.getProperty('APP_EMAIL_SHARED_SECRET');
    if (!expectedSecret || typeof request.secret !== 'string' || request.secret !== expectedSecret) return jsonOutput({ success: false, error: 'unauthorized' });
    if (!validEmail(request.to)) return jsonOutput({ success: false, error: 'invalid_recipient' });
    if (!/^[A-Za-z0-9_.:-]{8,160}$/.test(request.eventKey || '')) return jsonOutput({ success: false, error: 'invalid_event_key' });
    if (request.templateVersion !== '1' || !request.values || typeof request.values !== 'object') return jsonOutput({ success: false, error: 'invalid_template_request' });

    var cache = CacheService.getScriptCache();
    var cacheKey = 'mail:' + Utilities.base64EncodeWebSafe(request.eventKey).substring(0, 180);
    lock.waitLock(10000);
    var cachedStatus = cache.get(cacheKey);
    if (cachedStatus === 'sent' || cachedStatus === 'sending') {
      lock.releaseLock();
      return jsonOutput({ success: true, duplicate: true, pending: cachedStatus === 'sending' });
    }
    cache.put(cacheKey, 'sending', 300);
    lock.releaseLock();

    var rendered = renderTemplate(request.templateKey, request.values, request.approvedContent);
    var mailOptions = {
      htmlBody: rendered.htmlBody,
      name: properties.getProperty('SENDER_NAME') || 'Invitation Homes',
      replyTo: properties.getProperty('REPLY_TO') || 'no-reply@invitationhomes.com'
    };
    var fromAlias = properties.getProperty('SENDER_EMAIL_ALIAS');
    if (fromAlias) mailOptions.from = fromAlias;
    GmailApp.sendEmail(request.to, rendered.subject, rendered.textBody, mailOptions);
    cache.put(cacheKey, 'sent', 21600);
    return jsonOutput({ success: true });
  } catch (error) {
    try {
      var properties = PropertiesService.getScriptProperties();
      var request = event && event.postData && event.postData.contents ? JSON.parse(event.postData.contents) : {};
      if (request.eventKey) CacheService.getScriptCache().remove('mail:' + Utilities.base64EncodeWebSafe(request.eventKey).substring(0, 180));
    } catch (_ignored) {}
    console.error('Transactional email send failed: ' + (error && error.message ? error.message : 'unknown error'));
    return jsonOutput({ success: false, error: 'send_failed' });
  }
}

function doGet() {
  return ContentService.createTextOutput('Email endpoint is online.').setMimeType(ContentService.MimeType.TEXT);
}
