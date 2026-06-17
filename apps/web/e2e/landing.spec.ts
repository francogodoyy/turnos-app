import { test, expect } from "@playwright/test";

test("landing page loads and shows professionals", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("TurnosApp")).toBeVisible();
  await expect(page.getByText("Reservá turnos con profesionales")).toBeVisible();
});

test("login page is accessible", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Iniciar sesión")).toBeVisible();
});

test("register page is accessible", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByText("Crear cuenta")).toBeVisible();
});

test("404 page shows for unknown routes", async ({ page }) => {
  await page.goto("/ruta-inexistente");
  await expect(page.getByText("404")).toBeVisible();
  await expect(page.getByText("Esta página no existe")).toBeVisible();
});
