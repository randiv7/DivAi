/// <reference types="expo" />

declare global {
    namespace NodeJS {
      interface ProcessEnv {
        EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
      }
    }
  }
  
  // Keeps this file a module
  export {};