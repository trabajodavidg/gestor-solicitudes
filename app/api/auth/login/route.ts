import { NextResponse } from "next/server";
import { users } from "@/lib/memoryStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validar campos obligatorios
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    // Buscar usuario por correo
    const user = users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { message: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Validar contraseña
    if (user.password !== password) {
      return NextResponse.json(
        { message: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Generar token simple (simulación de sesión)
    const token = Buffer.from(
      `${user.id}:${Date.now()}`
    ).toString("base64");

    return NextResponse.json(
      {
        message: "Login exitoso",
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error en el login" },
      { status: 500 }
    );
  }
}