import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001/api/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const form = new URLSearchParams();
    form.append("username", body.username);
    form.append("name", body.name);
    form.append("email", body.email);
    form.append("password", body.password);
    form.append("passwordConfirmation", body.passwordConfirmation);

    const resp = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const data = await resp.json();

    // Jika backend mengirim error dengan status code != 200
    if (!resp.ok) {
      let errorMessage = data.message || "Registration failed";

      // Handle berbagai jenis error dari backend
      if (resp.status === 409) {
        // Conflict - username/email sudah digunakan
        errorMessage = data.message || "Username or email already exists";
      } else if (resp.status === 400) {
        // Bad request - validasi gagal
        // Jika ada detail errors, ambil pesan error pertama
        if (data.errors && typeof data.errors === "object") {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          } else {
            errorMessage = "Please fill in all required fields";
          }
        } else {
          errorMessage = "Invalid registration data";
        }
      }

      return NextResponse.json(
        { success: false, message: errorMessage, data: null },
        { status: resp.status }
      );
    } // Success response
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error", data: null },
      { status: 500 }
    );
  }
}
