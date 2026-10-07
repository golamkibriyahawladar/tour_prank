export interface District {
  n: string; // English name, e.g. "Dhaka"
  dv: string; // Division, e.g. "Dhaka"
  d: string; // SVG path data
  c: [number, number]; // Center coordinates [x, y]
  nameBn: string; // Bangla name, e.g. "ঢাকা"
  divisionBn: string; // Bangla division, e.g. "ঢাকা"
}

export interface Division {
  key: string;
  nameEn: string;
  nameBn: string;
}

export interface MapTheme {
  id: string;
  nameEn: string;
  nameBn: string;
  bg: string;
  land: string;
  stroke: string;
  v1: string; // Primary visited color
  v2: string; // Secondary visited color / gradient end
  vStroke: string;
  ink: string;
  muted: string;
  label: string;
  halo?: string;
  dot: string;
  track: string;
  glow?: string;
  chipInk?: string;
}

export interface WorldCountry {
  i: string; // Country code e.g. "BGD"
  n: string; // English name
  b: string; // Bangla name
  ct: string; // Continent code: "as", "eu", "af", "na", "sa", "oc"
  d: string; // SVG path
}
