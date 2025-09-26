declare module 'react-qr-code' {
  export interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      x?: number;
      y?: number;
      height: number;
      width: number;
      excavate?: boolean;
    };
    style?: React.CSSProperties;
    viewBox?: string;
  }

  const QRCode: React.ComponentType<QRCodeProps>;
  export default QRCode;
}
