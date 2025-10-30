import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001/api/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const form = new URLSearchParams();
    form.append("usernameoremail", body.usernameoremail);
    form.append("password", body.password);

    const resp = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const data = await resp.json();

    // Jika backend mengirim error dengan status code != 200
    if (!resp.ok) {
      // Parse pesan error yang lebih spesifik
      let errorMessage = data.message || "Login failed";

      // Handle berbagai jenis error dari backend
      if (resp.status === 401) {
        // Unauthorized - kredensial salah
        errorMessage = "Invalid email/username or password";
      } else if (resp.status === 403) {
        // Forbidden - akun belum diverifikasi
        errorMessage = data.message || "Account not verified";
      } else if (resp.status === 400) {
        // Bad request - validasi gagal
        // Untuk login, semua error validasi (termasuk password format/length)
        // harus ditampilkan sebagai generic message untuk keamanan
        // Kecuali jika field benar-benar kosong (yang sudah dicatch di frontend)
        errorMessage = "Invalid email/username or password";
      }

      return NextResponse.json(
        { success: false, message: errorMessage, data: null },
        { status: resp.status }
      );
    }

    // Success response
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message || "Server error", data: null },
      { status: 500 }
    );
  }
}
