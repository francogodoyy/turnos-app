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
