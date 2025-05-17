import { executeDbQuery } from "@/lib/db-utils";
import { supabaseClient } from "@/lib/supabaseClient";
import { TABLES } from "@/lib/supabaseClient";
import { ResearchSession, ResearchResult, Source } from "@/types";

/**
 * リサーチセッションの取得
 * @param sessionId セッションID
 * @returns リサーチセッション
 */
export async function getResearchSession(sessionId: string): Promise<ResearchSession> {
  return executeDbQuery(() =>
    supabaseClient
      .from(TABLES.RESEARCH_SESSIONS)
      .select("*")
      .eq("id", sessionId)
      .single()
  );
}

/**
 * ユーザーのリサーチセッション一覧を取得
 * @param userId ユーザーID
 * @returns リサーチセッションの配列
 */
export async function getUserResearchSessions(userId: string): Promise<ResearchSession[]> {
  return executeDbQuery(() =>
    supabaseClient
      .from(TABLES.RESEARCH_SESSIONS)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  );
}

/**
 * リサーチ結果の取得
 * @param sessionId セッションID
 * @returns リサーチ結果
 */
export async function getResearchResult(sessionId: string): Promise<ResearchResult> {
  return executeDbQuery(() =>
    supabaseClient
      .from(TABLES.RESEARCH_RESULTS)
      .select("*")
      .eq("session_id", sessionId)
      .single()
  );
}

/**
 * リサーチソースの取得
 * @param resultId 結果ID
 * @returns ソースの配列
 */
export async function getResearchSources(resultId: string): Promise<Source[]> {
  return executeDbQuery(() =>
    supabaseClient
      .from(TABLES.SOURCES)
      .select("*")
      .eq("research_result_id", resultId)
  );
}

/**
 * リサーチセッションの作成
 * @param data セッションデータ
 * @returns 作成されたセッション
 */
export async function createResearchSession(data: Partial<ResearchSession>): Promise<ResearchSession> {
  console.log("Creating research session with data:", data);
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Supabase Anon Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return executeDbQuery(async () => {
    try {
      console.log("Inserting data into table:", TABLES.RESEARCH_SESSIONS);
      const result = await supabaseClient
        .from(TABLES.RESEARCH_SESSIONS)
        .insert(data)
        .select();

      console.log("Insert result:", result);

      const { data: insertedData, error } = result;

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      if (!insertedData || insertedData.length === 0) {
        console.error("No data returned after insert");
        throw new Error("データが見つかりませんでした");
      }

      console.log("Successfully inserted data:", insertedData[0]);
      return { data: insertedData[0], error };
    } catch (error) {
      console.error("Error in createResearchSession:", error);
      throw error;
    }
  });
}

/**
 * リサーチセッションの更新
 * @param sessionId セッションID
 * @param data 更新データ
 * @returns 更新されたセッション
 */
export async function updateResearchSession(
  sessionId: string,
  data: Partial<ResearchSession>
): Promise<ResearchSession> {
  return executeDbQuery(async () => {
    const { data: updatedData, error } = await supabaseClient
      .from(TABLES.RESEARCH_SESSIONS)
      .update(data)
      .eq("id", sessionId)
      .select();

    if (error) {
      throw error;
    }

    if (!updatedData || updatedData.length === 0) {
      throw new Error("データが見つかりませんでした");
    }

    return { data: updatedData[0], error };
  });
}

/**
 * リサーチ結果の保存
 * @param data 結果データ
 * @returns 保存された結果
 */
export async function saveResearchResult(data: Partial<ResearchResult>): Promise<ResearchResult> {
  return executeDbQuery(async () => {
    const { data: insertedData, error } = await supabaseClient
      .from(TABLES.RESEARCH_RESULTS)
      .insert(data)
      .select();

    if (error) {
      throw error;
    }

    if (!insertedData || insertedData.length === 0) {
      throw new Error("データが見つかりませんでした");
    }

    return { data: insertedData[0], error };
  });
}

/**
 * ソースの保存
 * @param data ソースデータの配列
 * @returns 保存されたソースの配列
 */
export async function saveSources(data: Partial<Source>[]): Promise<Source[]> {
  return executeDbQuery(() =>
    supabaseClient
      .from(TABLES.SOURCES)
      .insert(data)
      .select()
  );
}

/**
 * リサーチの完全な結果を取得（セッション、結果、ソースを含む）
 * @param sessionId セッションID
 * @returns 完全なリサーチ結果
 */
export async function getCompleteResearchResult(sessionId: string) {
  const session = await getResearchSession(sessionId);

  try {
    const result = await getResearchResult(sessionId);
    const sources = await getResearchSources(result.id);

    return {
      session,
      result,
      sources,
      status: session.status
    };
  } catch (error) {
    // 結果がまだ存在しない場合
    return {
      session,
      result: null,
      sources: [],
      status: session.status
    };
  }
}
