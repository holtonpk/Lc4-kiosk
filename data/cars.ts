export interface CarSpec {
  engine: string[];
  drivetrain: string[];
  performance: string[];
  dimensions: string[];
}

export interface Car {
  id: string;
  year: number;
  model: string;
  shortName: string;
  edition?: string;
  productionNumber?: string;
  usCount?: string;
  tagline: string;
  heroImage: string;
  horsepower?: number;
  topSpeed?: number;
  zeroToSixty?: number;
  specs: CarSpec;
  videos: {title: string; url: string}[];
  photos: string[];
}

export const cars: Car[] = [
  {
    id: "911-spirit-70",
    year: 2021,
    model: "911 Spirit 70",
    shortName: "911 Spirit 70",
    edition: "Heritage Design Series",
    productionNumber: "xxx/1200",
    usCount: "~300 in the United States",
    tagline: "The first car released in the Heritage Design Series",
    heroImage: "/cars/spirit-70.png",
    horsepower: 443,
    topSpeed: 182,
    zeroToSixty: 3.6,
    specs: {
      engine: [
        "3.0L Twin-Turbocharged Flat-Six",
        "443 hp @ 6,500 rpm",
        "390 lb-ft torque @ 2,300–5,000 rpm",
      ],
      drivetrain: [
        "Rear-Wheel Drive",
        "8-Speed PDK Dual-Clutch Transmission",
        "Porsche Traction Management (PTM)",
      ],
      performance: [
        "0–60 mph: 3.6 seconds",
        "Top Speed: 182 mph",
        "PASM Sport Suspension",
      ],
      dimensions: [
        "Length: 178.2 in",
        "Width: 74.0 in",
        "Wheelbase: 96.5 in",
        "Curb Weight: 3,417 lbs",
      ],
    },
    videos: [],
    photos: [],
  },
  {
    id: "911-sport-classic",
    year: 2023,
    model: "911 Sport Classic",
    shortName: "911 Sport Classic",
    edition: "Heritage Design Series",
    productionNumber: "xxx/1500",
    usCount: "~500 in the United States",
    tagline: "The second car released in the Heritage Design Series",
    heroImage: "/cars/sport-classic.png",
    horsepower: 543,
    topSpeed: 196,
    zeroToSixty: 4.0,
    specs: {
      engine: [
        "3.7L Twin-Turbocharged Flat-Six",
        "543 hp @ 6,750 rpm",
        "442 lb-ft torque @ 2,500–4,500 rpm",
      ],
      drivetrain: [
        "Rear-Wheel Drive",
        "7-Speed Manual Transmission (Sport Classic exclusive)",
        "Sport Chrono Package",
      ],
      performance: [
        "0–60 mph: 4.0 seconds",
        "Top Speed: 196 mph",
        "PASM Sport Suspension with PDCC",
      ],
      dimensions: [
        "Length: 178.2 in",
        "Width: 74.0 in",
        "Wheelbase: 96.5 in",
        "Curb Weight: 3,307 lbs",
      ],
    },
    videos: [],
    photos: [],
  },
  {
    id: "911-turbo-s",
    year: 2026,
    model: "911 Turbo S",
    shortName: "911 Turbo S",
    edition: "Heritage Design Series",
    productionNumber: "867/1500",
    usCount: "~90 in the United States",
    tagline: "The third car released in the Heritage Design Series",
    heroImage: "/cars/turbo-s.png",
    horsepower: 473,
    topSpeed: 185,
    zeroToSixty: 3.5,
    specs: {
      engine: ["3.6L Twin-Turbocharged Flat-Six", "473 hp", "420 lb-ft torque"],
      drivetrain: [
        "Rear-Wheel Drive",
        "8-Speed PDK Dual-Clutch Transmission",
        "Heritage Design livery and badging",
      ],
      performance: [
        "0–60 mph: 3.5 seconds",
        "Top Speed: 185 mph",
        "Inspired by 1970s Porsche racing heritage",
      ],
      dimensions: [
        "Length: 178.2 in",
        "Width: 74.0 in",
        "Wheelbase: 96.5 in",
        "Curb Weight: ~3,400 lbs",
      ],
    },
    videos: [],
    photos: [],
  },
  {
    id: "718-spyder-rs",
    year: 2025,
    model: "718 Spyder RS",
    shortName: "718 Spyder RS",
    tagline: "AKA the GT4 RS with No Roof",
    heroImage: "/cars/spider-rs.png",
    horsepower: 500,
    topSpeed: 186,
    zeroToSixty: 3.2,
    specs: {
      engine: [
        "4.0L Naturally Aspirated Flat-Six (Derived from 911 GT3)",
        "500 hp @ 9,000 rpm",
        "309 lb-ft torque @ 7,000 rpm",
      ],
      drivetrain: [
        "Rear-Wheel Drive",
        "7-Speed PDK Dual-Clutch Transmission",
        "Porsche Active Suspension Management (PASM)",
      ],
      performance: [
        "0–60 mph: 3.2 seconds",
        "Top Speed: 186 mph",
        "Revs to 9,000 rpm",
      ],
      dimensions: [
        "Length: 174.6 in",
        "Width: 72.9 in",
        "Wheelbase: 97.4 in",
        "Curb Weight: 3,131 lbs",
      ],
    },
    videos: [],
    photos: [],
  },
  {
    id: "911-targa-4s",
    year: 1955,
    model: "911 Targa 4S heritage design edition",
    shortName: "550A",
    tagline: 'AKA "Little Bastard" — The James Dean Car',
    heroImage: "/cars/targa-4s.png",
    horsepower: 135,
    topSpeed: 140,
    specs: {
      engine: [
        "1.5L Flat-Four (Fuhrmann Type 547)",
        "~135 hp",
        "Four overhead camshafts",
      ],
      drivetrain: [
        "Rear-Wheel Drive",
        "5-Speed Manual Transmission",
        "Replica built by Thunder Ranch",
        "Commissioned by Rick Hendrick of Hendrick Motorsports",
      ],
      performance: [
        "Top Speed: ~140 mph",
        "Weight: ~1,300 lbs",
        "Won its class at 1956 Targa Florio",
      ],
      dimensions: [
        "Length: 142.0 in",
        "Width: 59.1 in",
        "Wheelbase: 82.7 in",
        "Curb Weight: ~1,300 lbs",
      ],
    },
    videos: [],
    photos: [],
  },
];
