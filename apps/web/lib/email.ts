import { Resend } from "resend";
import { prisma } from "@turnos/db";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM || "TurnosApp <onboarding@resend.dev>";

function confirmationHtml({
  clientName,
  professionalName,
  specialty,
  date,
  time,
  duration,
}: {
  clientName: string;
  professionalName: string;
  specialty: string | null;
  date: string;
  time: string;
  duration: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f5f5f5;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <h1 style="font-size:20px;margin:0 0 4px;color:#1f2937">${clientName}</h1>
    <p style="color:#6b7280;margin:0 0 20px">Tu turno fue confirmado</p>
    <div style="background:#f0f5ff;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-size:14px;color:#374151">
        <strong style="color:#2563eb">${professionalName}</strong>
        ${specialty ? `— ${specialty}` : ""}
      </p>
      <p style="margin:0;font-size:14px;color:#374151">${date} · ${time} · ${duration} min</p>
    </div>
    <p style="font-size:13px;color:#9ca3af;margin:0">TurnosApp</p>
  </div>
</body>
</html>`;
}

function reminderHtml({
  clientName,
  professionalName,
  date,
  time,
}: {
  clientName: string;
  professionalName: string;
  date: string;
  time: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f5f5f5;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <h1 style="font-size:20px;margin:0 0 4px;color:#1f2937">Recordatorio</h1>
    <p style="color:#6b7280;margin:0 0 20px">Tenés un turno mañana</p>
    <div style="background:#fefce8;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-size:14px;color:#374151">
        <strong style="color:#ca8a04">${professionalName}</strong>
      </p>
      <p style="margin:0;font-size:14px;color:#374151">${date} · ${time}</p>
    </div>
    <p style="font-size:13px;color:#9ca3af;margin:0">TurnosApp</p>
  </div>
</body>
</html>`;
}

export async function sendConfirmation(params: {
  email: string;
  clientName: string;
  professionalName: string;
  specialty: string | null;
  date: string;
  time: string;
  duration: number;
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: "Turno confirmado — TurnosApp",
    html: confirmationHtml(params),
  });
}

export async function sendReminder(params: {
  email: string;
  clientName: string;
  professionalName: string;
  date: string;
  time: string;
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: "Recordatorio de turno — TurnosApp",
    html: reminderHtml(params),
  });
}

export async function sendTomorrowReminders() {
  const resend = getResend();
  if (!resend) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      reminderSent: false,
      date: { gte: tomorrow, lt: dayAfter },
    },
    include: {
      client: { select: { name: true, email: true } },
      professional: { include: { user: { select: { name: true } } } },
    },
  });

  for (const apt of appointments) {
    await sendReminder({
      email: apt.client.email!,
      clientName: apt.client.name!,
      professionalName: apt.professional.user.name!,
      date: apt.date.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "America/Argentina/Buenos_Aires",
      }),
      time: apt.date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    }).catch(() => {});

    await prisma.appointment.update({
      where: { id: apt.id },
      data: { reminderSent: true },
    });
  }
}
