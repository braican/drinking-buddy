export interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  status?: number;
}
