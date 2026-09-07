/**
 * Type bridge for firebase/auth in React Native.
 *
 * Firebase v12 ships `getReactNativePersistence` only through the
 * "react-native" export condition of @firebase/auth — Metro resolves it
 * automatically at runtime, but the Node-flavoured type declarations that
 * `tsc` resolves do not export it, which would otherwise surface as
 * TS2305 ("has no exported member").
 *
 * This is an augmentation, not a reimplementation: at runtime the real RN
 * build provides the function.
 */
import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  /**
   * Persistence helper backed by @react-native-async-storage/async-storage,
   * so an anonymous sign-in survives app restarts.
   */
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}