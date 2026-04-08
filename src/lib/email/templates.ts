function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background-color:#ffffff;border-radius:8px;padding:32px;border:1px solid #e5e7eb;">
      ${content}
    </div>
    <div style="text-align:center;padding:16px 0;color:#9ca3af;font-size:12px;">
      Sent by Conca
    </div>
  </div>
</body>
</html>`;
}

export function taskAssignedTemplate({
  taskTitle,
  assigneeName,
  dueDate,
  entityName,
  appUrl,
}: {
  taskTitle: string;
  assigneeName: string;
  dueDate: string | null;
  entityName: string | null;
  appUrl: string;
}): string {
  const dueLine = dueDate
    ? `<p style="margin:8px 0;color:#6b7280;font-size:14px;">Due: <strong>${dueDate}</strong></p>`
    : "";
  const entityLine = entityName
    ? `<p style="margin:8px 0;color:#6b7280;font-size:14px;">Related to: ${entityName}</p>`
    : "";

  return baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">New Task Assigned</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi ${assigneeName},</p>
    <p style="margin:8px 0;color:#374151;font-size:14px;">You've been assigned a task:</p>
    <div style="background-color:#f3f4f6;border-radius:6px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#111827;font-size:16px;font-weight:600;">${taskTitle}</p>
      ${dueLine}
      ${entityLine}
    </div>
    <a href="${appUrl}/tasks" style="display:inline-block;background-color:#2563eb;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;margin-top:8px;">View Tasks</a>
  `);
}

export function taskDueReminderTemplate({
  tasks,
  userName,
  appUrl,
}: {
  tasks: Array<{ title: string; dueDate: string; entityName: string | null }>;
  userName: string;
  appUrl: string;
}): string {
  const taskRows = tasks
    .map(
      (t) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">${t.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${t.dueDate}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${t.entityName ?? "\u2014"}</td>
    </tr>`
    )
    .join("");

  return baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">Task Reminder</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:14px;">Hi ${userName}, you have ${tasks.length} task${tasks.length !== 1 ? "s" : ""} due tomorrow:</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background-color:#f9fafb;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Task</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Due</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Related To</th>
        </tr>
      </thead>
      <tbody>${taskRows}</tbody>
    </table>
    <a href="${appUrl}/tasks" style="display:inline-block;background-color:#2563eb;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;margin-top:16px;">View Tasks</a>
  `);
}

export function invitationTemplate({
  orgName,
  inviteeName,
  acceptUrl,
}: {
  orgName: string;
  inviteeName: string;
  acceptUrl: string;
}): string {
  return baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">You're Invited!</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:14px;">Hi${inviteeName ? ` ${inviteeName}` : ""},</p>
    <p style="margin:8px 0;color:#374151;font-size:14px;">You've been invited to join <strong>${orgName}</strong> on Conca, the real estate investment management platform.</p>
    <a href="${acceptUrl}" style="display:inline-block;background-color:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;margin-top:16px;">Accept Invitation</a>
    <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">This invitation will expire in 7 days.</p>
  `);
}

export function leaseExpiryAlertTemplate({
  leases,
  appUrl,
}: {
  leases: Array<{
    propertyName: string;
    tenantName: string;
    endDate: string;
    daysRemaining: number;
  }>;
  appUrl: string;
}): string {
  const leaseRows = leases
    .map(
      (l) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">${l.propertyName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${l.tenantName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${l.endDate}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:${l.daysRemaining <= 30 ? "#dc2626" : "#6b7280"};">${l.daysRemaining}d</td>
    </tr>`
    )
    .join("");

  return baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">Lease Expiry Alert</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:14px;">${leases.length} lease${leases.length !== 1 ? "s" : ""} expiring within the next 30 days:</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background-color:#f9fafb;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Property</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Tenant</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">End Date</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Days Left</th>
        </tr>
      </thead>
      <tbody>${leaseRows}</tbody>
    </table>
    <a href="${appUrl}/properties" style="display:inline-block;background-color:#2563eb;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;margin-top:16px;">View Properties</a>
  `);
}
