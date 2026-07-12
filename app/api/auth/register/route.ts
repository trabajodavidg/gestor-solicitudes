import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { users } from "@/lib/memoryStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, email, password, role } = body;

    // Validar campos obligatorios
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { message: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si el correo ya está registrado
    const userExists = users.find((u) => u.email === email);

    if (userExists) {
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 409 }
      );
    }

    // Crear el nuevo usuario
    const newUser: User = {
      id: Date.now().toString(),
      nombre,
      email,
      password,
      role: role || "usuario",
    };

    // Guardar el usuario en el almacenamiento compartido
    users.push(newUser);

    return NextResponse.json(
      {
        message: "Usuario registrado correctamente",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error en el registro" },
      { status: 500 }
    );
  }
}