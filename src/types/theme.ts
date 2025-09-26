export interface ColorPalette {
  [colorName: string]: string;
}

export interface Theme {
  id: string;
  name: string;
  palette: ColorPalette;
} 