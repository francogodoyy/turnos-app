import { z } from "zod";

export const DAYS_OF_WEEK = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["PROFESSIONAL", "CLIENT"]).default("CLIENT"),
});

export const AvailabilitySlot = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const CreateAppointmentSchema = z.object({
  professionalId: z.string().cuid(),
  date: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type AvailabilitySlotInput = z.infer<typeof AvailabilitySlot>;
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export const TZ_ARGENTINA = "America/Argentina/Buenos_Aires";
export const UTC_OFFSET_ARG = -3; // hours

export function toTzDate(date: Date, offsetHours: number = UTC_OFFSET_ARG): Date {
  return new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
}

export function todayRange(offsetHours: number = UTC_OFFSET_ARG): { start: Date; end: Date } {
  const now = new Date();
  const nowLocal = toTzDate(now, offsetHours);
  const startLocal = new Date(nowLocal);
  startLocal.setHours(0, 0, 0, 0);
  const endLocal = new Date(startLocal);
  endLocal.setDate(endLocal.getDate() + 1);
  return {
    start: toTzDate(startLocal, -offsetHours),
    end: toTzDate(endLocal, -offsetHours),
  };
}
