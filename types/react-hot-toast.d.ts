declare module 'react-hot-toast' {
  export interface ToastOptions {
    id?: string;
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    style?: React.CSSProperties;
    className?: string;
    icon?: React.ReactNode;
    iconTheme?: {
      primary: string;
      secondary: string;
    };
    ariaProps?: {
      role: 'status' | 'alert';
      'aria-live': 'assertive' | 'off' | 'polite';
    };
  }

  export interface Toast {
    type: 'blank' | 'error' | 'loading' | 'success';
    id: string;
    message: string;
    duration?: number;
    pauseDuration: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    style?: React.CSSProperties;
    className?: string;
    icon?: React.ReactNode;
    iconTheme?: {
      primary: string;
      secondary: string;
    };
    ariaProps?: {
      role: 'status' | 'alert';
      'aria-live': 'assertive' | 'off' | 'polite';
    };
    createdAt: number;
    visible: boolean;
    height?: number;
  }

  const toast: {
    (message: string, options?: ToastOptions): string;
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    loading: (message: string, options?: ToastOptions) => string;
    custom: (jsx: React.ReactNode, options?: ToastOptions) => string;
    dismiss: (toastId?: string) => void;
    remove: (toastId?: string) => void;
    promise: <T>(
      promise: Promise<T>,
      msgs: {
        loading: React.ReactNode;
        success: (value: T) => React.ReactNode;
        error: (err: any) => React.ReactNode;
      },
      options?: ToastOptions
    ) => Promise<T>;
  };

  export default toast;

  export const Toaster: React.ComponentType<{
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    toastOptions?: ToastOptions;
    reverseOrder?: boolean;
    gutter?: number;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
  }>;
}
