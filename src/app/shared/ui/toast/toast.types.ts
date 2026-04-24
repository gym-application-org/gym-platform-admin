/** Visual role mapped to semantic tokens in `enterprise-palette.scss`. */
export type ToastSeverity = 'success' | 'danger' | 'attention' | 'accent' | 'neutral';

export interface ToastItem {
  id: string;
  message: string;
  severity: ToastSeverity;
}
