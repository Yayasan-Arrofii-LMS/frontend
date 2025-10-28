import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001/api/v1";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const resp = await fetch(`${API_BASE}/reset-password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
