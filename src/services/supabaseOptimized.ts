import { supabase } from './supabaseClient';
import type { PostgrestError } from '@supabase/supabase-js';

interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
  success: boolean;
}

interface BatchQueryConfig {
  maxRetries?: number;
  retryDelay?: number;
  batchSize?: number;
}

const DEFAULT_CONFIG: Required<BatchQueryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  batchSize: 100,
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const supabaseOptimized = {
  async withRetry<T>(
    operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    config: BatchQueryConfig = {}
  ): Promise<QueryResult<T>> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    let lastError: PostgrestError | null = null;

    for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
      try {
        const { data, error } = await operation();

        if (!error) {
          return { data, error: null, success: true };
        }

        lastError = error;
        console.error(
          `[Supabase] Attempt ${attempt + 1}/${finalConfig.maxRetries} failed:`,
          error.message
        );

        if (attempt < finalConfig.maxRetries - 1) {
          const delay = finalConfig.retryDelay * Math.pow(2, attempt);
          console.log(`[Supabase] Retrying in ${delay}ms...`);
          await sleep(delay);
        }
      } catch (error) {
        console.error('[Supabase] Unexpected error:', error);
        lastError = {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: '',
          hint: '',
          code: 'UNKNOWN',
        };
      }
    }

    return { data: null, error: lastError, success: false };
  },

  async batchInsert<T extends Record<string, any>>(
    tableName: string,
    records: T[],
    config: BatchQueryConfig = {}
  ): Promise<{ inserted: number; errors: string[] }> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const errors: string[] = [];
    let inserted = 0;

    for (let i = 0; i < records.length; i += finalConfig.batchSize) {
      const batch = records.slice(i, i + finalConfig.batchSize);

      console.log(
        `[Supabase] Inserting batch ${Math.floor(i / finalConfig.batchSize) + 1}/${Math.ceil(records.length / finalConfig.batchSize)}`
      );

      const result = await this.withRetry(
        () => supabase.from(tableName).insert(batch),
        config
      );

      if (result.success) {
        inserted += batch.length;
      } else {
        errors.push(
          `Batch ${i}-${i + batch.length}: ${result.error?.message || 'Unknown error'}`
        );
      }

      if (i + finalConfig.batchSize < records.length) {
        await sleep(100);
      }
    }

    console.log(`[Supabase] Batch insert complete: ${inserted}/${records.length} inserted`);
    return { inserted, errors };
  },

  async batchUpdate<T extends Record<string, any>>(
    tableName: string,
    updates: Array<{ id: string; data: Partial<T> }>,
    config: BatchQueryConfig = {}
  ): Promise<{ updated: number; errors: string[] }> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const errors: string[] = [];
    let updated = 0;

    for (let i = 0; i < updates.length; i += finalConfig.batchSize) {
      const batch = updates.slice(i, i + finalConfig.batchSize);

      for (const update of batch) {
        const result = await this.withRetry(
          () =>
            supabase
              .from(tableName)
              .update(update.data)
              .eq('id', update.id),
          config
        );

        if (result.success) {
          updated++;
        } else {
          errors.push(
            `Update ${update.id}: ${result.error?.message || 'Unknown error'}`
          );
        }
      }

      if (i + finalConfig.batchSize < updates.length) {
        await sleep(100);
      }
    }

    console.log(`[Supabase] Batch update complete: ${updated}/${updates.length} updated`);
    return { updated, errors };
  },

  async batchSelect<T>(
    tableName: string,
    ids: string[],
    config: BatchQueryConfig = {}
  ): Promise<T[]> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const allResults: T[] = [];

    for (let i = 0; i < ids.length; i += finalConfig.batchSize) {
      const batch = ids.slice(i, i + finalConfig.batchSize);

      const result = await this.withRetry(
        () => supabase.from(tableName).select('*').in('id', batch),
        config
      );

      if (result.success && result.data) {
        allResults.push(...(result.data as T[]));
      }

      if (i + finalConfig.batchSize < ids.length) {
        await sleep(50);
      }
    }

    return allResults;
  },

  async safeSelect<T>(
    tableName: string,
    query: (qb: any) => any,
    config: BatchQueryConfig = {}
  ): Promise<QueryResult<T[]>> {
    return this.withRetry(
      async () => {
        const queryBuilder = supabase.from(tableName).select('*');
        const finalQuery = query(queryBuilder);
        return await finalQuery;
      },
      config
    );
  },

  async upsertWithRetry<T extends Record<string, any>>(
    tableName: string,
    records: T[],
    conflictColumns: string[],
    config: BatchQueryConfig = {}
  ): Promise<{ upserted: number; errors: string[] }> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const errors: string[] = [];
    let upserted = 0;

    for (let i = 0; i < records.length; i += finalConfig.batchSize) {
      const batch = records.slice(i, i + finalConfig.batchSize);

      const result = await this.withRetry(
        () =>
          supabase
            .from(tableName)
            .upsert(batch, { onConflict: conflictColumns.join(',') }),
        config
      );

      if (result.success) {
        upserted += batch.length;
      } else {
        errors.push(
          `Batch ${i}-${i + batch.length}: ${result.error?.message || 'Unknown error'}`
        );
      }

      if (i + finalConfig.batchSize < records.length) {
        await sleep(100);
      }
    }

    console.log(`[Supabase] Batch upsert complete: ${upserted}/${records.length} upserted`);
    return { upserted, errors };
  },

  async getWithCache<T>(
    cacheKey: string,
    fetcher: () => Promise<QueryResult<T>>,
    cacheDuration: number = 60000
  ): Promise<T | null> {
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheDuration) {
          console.log(`[Cache] Using cached data for ${cacheKey}`);
          return data;
        }
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    const result = await fetcher();

    if (result.success && result.data) {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: result.data,
          timestamp: Date.now(),
        })
      );
      return result.data;
    }

    return null;
  },

  clearCache(keyPrefix?: string): void {
    if (keyPrefix) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(keyPrefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log(`[Cache] Cleared cache with prefix: ${keyPrefix}`);
    } else {
      localStorage.clear();
      console.log('[Cache] Cleared all cache');
    }
  },
};

export type { QueryResult, BatchQueryConfig };
