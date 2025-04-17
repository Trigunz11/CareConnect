import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { cedula, password, nombre, apellido, fecha_de_nacimiento, email, genero } =
      await request.json();

    // Validate required fields
    if (
      !cedula ||
      !password ||
      !nombre ||
      !apellido ||
      !fecha_de_nacimiento ||
      !email
      !genero
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await query(
      "SELECT * FROM users WHERE cedula = ? OR email = ?",
      [cedula, email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: "El usuario ya existe con esta cédula o email" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    await query(
      "INSERT INTO users (cedula, password, nombre, apellido, fecha_de_nacimiento, email, genero) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [cedula, hashedPassword, nombre, apellido, fecha_de_nacimiento, email, genero]
    );

    return NextResponse.json(
      { message: "Usuario registrado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
