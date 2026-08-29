// Type declaration to help TypeScript resolve exports from @op-engineering/op-sqlite
// The package does export 'open', but TypeScript sometimes has trouble resolving it
// due to the package's conditional exports structure with moduleResolution: "nodenext"
//
// This file augments the module declaration to ensure TypeScript can find the 'open' export
declare module "@op-engineering/op-sqlite" {
  export type QueryResult = {
    insertId?: number;
    rowsAffected: number;
    rows: {
      _array: any[];
      length: number;
      item: (index: number) => any;
    };
  };

  export type SQLiteRaw<T> = T;

  // Use a minimal DB type to avoid circular references and ESLint issues
  // The actual DB type is more complex, but this is sufficient for the open function
  export interface SQLiteDatabase {
    close: () => void;
    delete: (location?: string) => void;
    execute: (sql: string, params?: unknown[]) => Promise<QueryResult>;
    executeSync: (sql: string, params?: unknown[]) => QueryResult;
    executeQuery: (sql: string) => QueryResult;
    run: (sql: string) => SQLiteRaw<QueryResult>;
    [key: string]: unknown;
  }

  /**
   * Open a connection to a local sqlite or sqlcipher database
   * If you want libsql remote or sync connections, use openSync or openRemote
   */
  export const open: (params: {
    name: string;
    location?: string;
    encryptionKey?: string;
  }) => SQLiteDatabase;
}
