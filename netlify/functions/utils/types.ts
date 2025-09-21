export interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body?: string | null;
}
