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

    const data = await resp.text();
    return new Response(data, {
      status: resp.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
