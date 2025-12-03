import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const resp = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    // Jika backend mengirim error dengan status code != 200
    if (!resp.ok) {
      let errorMessage = data.message || "Failed to send reset code";

      // Handle berbagai jenis error dari backend
      if (resp.status === 404) {
        // Not found - email tidak terdaftar
        errorMessage = "Email not found";
      } else if (resp.status === 400) {
        // Bad request - validasi gagal
        // Jika ada detail errors, ambil pesan error pertama
        if (data.errors && typeof data.errors === "object") {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          } else {
            errorMessage = "Invalid email format";
          }
        } else {
          errorMessage = "Invalid email format";
        }
      }

      return NextResponse.json(
        { success: false, message: errorMessage, data: null },
        { status: resp.status }
      );
    } // Success response
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message || "Server error", data: null },
      { status: 500 }
    );
  }
}
