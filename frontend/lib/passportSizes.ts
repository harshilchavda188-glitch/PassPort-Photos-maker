// Country-wise passport photo size presets
export interface PassportSize {
  country: string;
  countryCode: string;
  width: number;
  height: number;
  unit: 'mm' | 'inch';
  dpi?: number;
  background: string;
}

export const passportSizes: PassportSize[] = [
  { country: 'United States', countryCode: 'US', width: 2, height: 2, unit: 'inch', dpi: 300, background: 'White' },
  { country: 'United Kingdom', countryCode: 'GB', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'Light grey or cream' },
  { country: 'India', countryCode: 'IN', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light-colored' },
  { country: 'China', countryCode: 'CN', width: 33, height: 48, unit: 'mm', dpi: 300, background: 'White, light blue, or light grey' },
  { country: 'Japan', countryCode: 'JP', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Australia', countryCode: 'AU', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'Plain light grey' },
  { country: 'Canada', countryCode: 'CA', width: 50, height: 70, unit: 'mm', dpi: 300, background: 'White or light-colored' },
  { country: 'Germany', countryCode: 'DE', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'Light grey, light blue, or white' },
  { country: 'France', countryCode: 'FR', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'Light grey, light blue, or white' },
  { country: 'Brazil', countryCode: 'BR', width: 50, height: 70, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Mexico', countryCode: 'MX', width: 30, height: 40, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'South Korea', countryCode: 'KR', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Russia', countryCode: 'RU', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Italy', countryCode: 'IT', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Spain', countryCode: 'ES', width: 32, height: 26, unit: 'mm', dpi: 300, background: 'White or light-colored' },
  { country: 'Netherlands', countryCode: 'NL', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Sweden', countryCode: 'SE', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Norway', countryCode: 'NO', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Denmark', countryCode: 'DK', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Finland', countryCode: 'FI', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Poland', countryCode: 'PL', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Turkey', countryCode: 'TR', width: 50, height: 60, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Saudi Arabia', countryCode: 'SA', width: 40, height: 60, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'UAE', countryCode: 'AE', width: 43, height: 55, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Singapore', countryCode: 'SG', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Malaysia', countryCode: 'MY', width: 35, height: 50, unit: 'mm', dpi: 300, background: 'White or light blue' },
  { country: 'Thailand', countryCode: 'TH', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Indonesia', countryCode: 'ID', width: 30, height: 40, unit: 'mm', dpi: 300, background: 'White or red' },
  { country: 'Philippines', countryCode: 'PH', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Vietnam', countryCode: 'VN', width: 40, height: 60, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Egypt', countryCode: 'EG', width: 40, height: 60, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'South Africa', countryCode: 'ZA', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Nigeria', countryCode: 'NG', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Argentina', countryCode: 'AR', width: 40, height: 40, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Chile', countryCode: 'CL', width: 32, height: 26, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Colombia', countryCode: 'CO', width: 30, height: 40, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Peru', countryCode: 'PE', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'New Zealand', countryCode: 'NZ', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Ireland', countryCode: 'IE', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Switzerland', countryCode: 'CH', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Austria', countryCode: 'AT', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Belgium', countryCode: 'BE', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Portugal', countryCode: 'PT', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Greece', countryCode: 'GR', width: 40, height: 60, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Czech Republic', countryCode: 'CZ', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
  { country: 'Israel', countryCode: 'IL', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White' },
  { country: 'Pakistan', countryCode: 'PK', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light blue' },
  { country: 'Bangladesh', countryCode: 'BD', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light blue' },
  { country: 'Ukraine', countryCode: 'UA', width: 35, height: 45, unit: 'mm', dpi: 300, background: 'White or light grey' },
];

export const getDimensions = (size: PassportSize): string => {
  return `${size.width}x${size.height} ${size.unit}`;
};

export const getPassportSizeByCountry = (countryCode: string): PassportSize | undefined => {
  return passportSizes.find((size) => size.countryCode === countryCode);
};

export const getAllCountries = (): PassportSize[] => {
  return passportSizes;
};

