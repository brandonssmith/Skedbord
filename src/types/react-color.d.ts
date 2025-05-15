declare module 'react-color' {
  import { Component } from 'react';
  
  interface ColorResult {
    hex: string;
    rgb: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    hsl: {
      h: number;
      s: number;
      l: number;
      a: number;
    };
  }

  interface ChromePickerProps {
    color?: string | { r: number; g: number; b: number; a: number };
    onChange?: (color: ColorResult) => void;
    onChangeComplete?: (color: ColorResult) => void;
    disableAlpha?: boolean;
  }

  export class ChromePicker extends Component<ChromePickerProps> {}
} 