/**
 * Google Apps Script 型定義
 * GAS環境で利用可能なグローバルオブジェクトの型定義
 */

declare var UrlFetchApp: {
  fetch(url: string, params?: any): {
    getContentText(): string;
    getResponseCode(): number;
  };
};

declare var Utilities: {
  sleep(milliseconds: number): void;
};

declare var CacheService: {
  getScriptCache(): {
    get(key: string): string | null;
    put(key: string, value: string, secondsToLive?: number): void;
  };
};

declare var PropertiesService: {
  getScriptProperties(): {
    getProperty(key: string): string | null;
    setProperty(key: string, value: string): void;
  };
};

declare var SpreadsheetApp: {
  getActiveSheet(): any;
  getActiveSpreadsheet(): any;
};

declare var Logger: {
  log(message: any): void;
};
