import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // Supabaseの接続情報を取得
    const { data: connectionInfo, error: connectionError } = await supabaseClient
      .from('pg_stat_activity')
      .select('*')
      .limit(1);

    // 利用可能なテーブルの一覧を取得
    const { data: tableList, error: tableError } = await supabaseClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    // Supabaseのバージョン情報を取得
    const { data: versionInfo, error: versionError } = await supabaseClient
      .from('pg_version')
      .select('*')
      .limit(1);

    return NextResponse.json({
      message: "Supabase connection test",
      connectionStatus: connectionError ? "Error" : "Connected",
      connectionError: connectionError ? connectionError.message : null,
      tableStatus: tableError ? "Error" : "Success",
      tableError: tableError ? tableError.message : null,
      tables: tableList || [],
      versionStatus: versionError ? "Error" : "Success",
      versionError: versionError ? versionError.message : null,
      versionInfo: versionInfo || null,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      // APIキーは表示しない
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
  } catch (error: any) {
    console.error("Supabase test error:", error);
    return NextResponse.json(
      { error: `Supabase test failed: ${error.message}` },
      { status: 500 }
    );
  }
}
