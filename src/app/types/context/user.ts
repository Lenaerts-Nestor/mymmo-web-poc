import { SessionData } from "../ouath/session";

export interface UserContextType {
  user: SessionData | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}
