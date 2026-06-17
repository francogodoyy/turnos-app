import { describe, it, expect } from "vitest";
import { toTzDate, todayRange, UTC_OFFSET_ARG, DAYS_OF_WEEK, RegisterSchema } from "@turnos/shared";

describe("toTzDate", () => {
  it("shifts UTC date by Argentina offset", () => {
    const utc = new Date("2026-06-17T14:30:00Z");
    const arg = toTzDate(utc);
    expect(arg.getUTCHours()).toBe(11);
    expect(arg.getUTCMinutes()).toBe(30);
  });

  it("shifts with custom offset", () => {
    const utc = new Date("2026-06-17T14:30:00Z");
    const shifted = toTzDate(utc, 3);
    expect(shifted.getUTCHours()).toBe(17);
  });
});

describe("todayRange", () => {
  it("returns start before end", () => {
    const { start, end } = todayRange();
    expect(start.getTime()).toBeLessThan(end.getTime());
  });
});

describe("DAYS_OF_WEEK", () => {
  it("has 7 days", () => {
    expect(DAYS_OF_WEEK).toHaveLength(7);
  });
});

describe("RegisterSchema", () => {
  it("accepts valid input", () => {
    const result = RegisterSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
      role: "CLIENT",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = RegisterSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      password: "123",
      role: "CLIENT",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = RegisterSchema.safeParse({
      name: "Test",
      email: "not-an-email",
      password: "123456",
      role: "CLIENT",
    });
    expect(result.success).toBe(false);
  });
});
