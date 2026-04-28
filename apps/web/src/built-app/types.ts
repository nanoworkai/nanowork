export type WaitlistEntry = {
  id: string;
  email: string;
  createdAt: string;
  source?: string;
};

export interface BuiltAppState {
  version: 1;
  prompt: string;
  slug: string;
  name: string;
  tagline: string;
  createdAt: string;
  signups: WaitlistEntry[];
}
