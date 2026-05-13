/**
 * SWR fetcher that uses our typed API client.
 */
import { api } from "./api";

export const swrFetcher = async <T,>(path: string): Promise<T> => {
  return api.get<T>(path);
};
