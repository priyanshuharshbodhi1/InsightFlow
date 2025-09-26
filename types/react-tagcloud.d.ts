declare module 'react-tagcloud' {
  export interface Tag {
    value: string;
    count: number;
    key?: string | number;
  }

  export interface TagCloudProps {
    minSize?: number;
    maxSize?: number;
    tags: Tag[];
    className?: string;
    onClick?: (tag: Tag, event: React.MouseEvent) => void;
    colorOptions?: {
      luminosity?: 'bright' | 'light' | 'dark' | 'random';
      hue?: string | number;
    };
    disableRandomColor?: boolean;
    randomSeed?: number;
    randomNumberGenerator?: () => number;
    shuffle?: boolean;
  }

  export const TagCloud: React.ComponentType<TagCloudProps>;
}
