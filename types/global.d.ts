/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace React {
  interface JSX {
    IntrinsicElements: any;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Extender React para incluir los hooks
declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
}
