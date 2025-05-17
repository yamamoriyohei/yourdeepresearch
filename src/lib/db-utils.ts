import { supabaseClient } from "@/lib/supabaseClient";

/**
 * データベースエラーをラップする関数
 * @param queryFn Supabaseクエリを実行する関数
 * @returns クエリ結果
 * @throws データベースエラー
 */
export async function executeDbQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const result = await queryFn();

    if (result.error) {
      console.error("Database error:", result.error);
      throw result.error;
    }

    if (result.data === null) {
      throw new Error("データが見つかりませんでした");
    }

    return result.data;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * IDによるレコード検索
 * @param table テーブル名
 * @param id レコードID
 * @returns 検索結果
 */
export async function findById<T>(table: string, id: string): Promise<T> {
  return executeDbQuery(() =>
    supabaseClient
      .from(table)
      .select("*")
      .eq("id", id)
      .single()
  );
}

/**
 * フィールド値によるレコード検索
 * @param table テーブル名
 * @param field フィールド名
 * @param value フィールド値
 * @returns 検索結果の配列
 */
export async function findByField<T>(
  table: string,
  field: string,
  value: any
): Promise<T[]> {
  return executeDbQuery(() =>
    supabaseClient
      .from(table)
      .select("*")
      .eq(field, value)
  );
}

/**
 * レコード作成
 * @param table テーブル名
 * @param data 作成データ
 * @returns 作成されたレコード
 */
export async function create<T>(table: string, data: any): Promise<T> {
  return executeDbQuery(() =>
    supabaseClient
      .from(table)
      .insert(data)
      .select()
      .single()
  );
}

/**
 * レコード更新
 * @param table テーブル名
 * @param id レコードID
 * @param data 更新データ
 * @returns 更新されたレコード
 */
export async function update<T>(
  table: string,
  id: string,
  data: any
): Promise<T> {
  return executeDbQuery(() =>
    supabaseClient
      .from(table)
      .update(data)
      .eq("id", id)
      .select()
      .single()
  );
}

/**
 * レコード削除
 * @param table テーブル名
 * @param id レコードID
 * @returns 削除成功の場合true
 */
export async function remove(table: string, id: string): Promise<boolean> {
  const { error } = await supabaseClient
    .from(table)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Database delete error:", error);
    throw error;
  }

  return true;
}
