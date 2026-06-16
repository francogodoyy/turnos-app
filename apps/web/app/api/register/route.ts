import { prisma } from "@turnos/db";
import { hash } from "bcryptjs";
import { RegisterSchema } from "@turnos/shared";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return Response.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    if (role === "PROFESSIONAL") {
      await prisma.professional.create({
        data: { userId: user.id },
      });
    }

    return Response.json(
      { message: "Usuario creado correctamente" },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
