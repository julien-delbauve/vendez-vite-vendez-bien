import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, citycode, cityName, propertyType } = body;

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const { error } = await getSupabase().from("leads").insert({
      email: email.toLowerCase().trim(),
      citycode: citycode || null,
      city_name: cityName || null,
      property_type: propertyType || null,
    });

    if (error) {
      // Duplicate email — treat as success (already registered)
      if (error.code === "23505") {
        return NextResponse.json({ success: true });
      }
      console.error("Supabase insert error:", JSON.stringify(error));
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
