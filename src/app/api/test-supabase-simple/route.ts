import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // 単純なクエリを実行してみる
    const { data, error } = await supabaseClient.from('pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public')
      .limit(10);

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message, 
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      tables: data,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKeys: {
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  } catch (error: any) {
    console.error("Supabase test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Supabase test failed: ${error.message}`,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
