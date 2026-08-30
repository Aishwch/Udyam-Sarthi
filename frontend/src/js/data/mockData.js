/* UDYAM SARTHI Synthetic Prototype Mock Data */
/* Prototype MSME: Fan Paint & Coating Manufacturing Enterprise */

export const INITIAL_BUSINESS_PROFILE = {
  name: "ABC Coating & Engineering Works",
  industry: "Fan Paint & Coating Manufacturing",
  product: "Industrial Powder-Coated Ceiling & Exhaust Fan Components",
  location: "Peenya Industrial Area, Bengaluru, Karnataka",
  msmeCategory: "Small Enterprise",
  employeeCount: 28,
  workingDaysPerWeek: 6,
  workingHoursPerDay: 8,
  shiftsPerDay: 1,
  productionUnit: "Units",
  onboardingCompleted: true,
  createdAt: "2026-01-15"
};

export const INITIAL_MACHINES = [
  {
    id: "m-101",
    name: "Machine A (Automated Powder Coater)",
    type: "Automated Powder Coating Line",
    manufacturer: "Surface Tech Pvt Ltd",
    model: "ST-APC-2021",
    ratedCapacity: 120, // units per hour
    capacityUnit: "Units/hr",
    powerRating: 45.0, // kW
    ageYears: 5,
    status: "Active",
    serialNumber: "APC-8892-X",
    lastMaintenance: "2026-08-10"
  },
  {
    id: "m-102",
    name: "Machine B (Spray Booth 2)",
    type: "Manual Wet Spray Booth",
    manufacturer: "EcoCoat Systems",
    model: "EC-SB-2023",
    ratedCapacity: 80,
    capacityUnit: "Units/hr",
    powerRating: 22.5,
    ageYears: 3,
    status: "Active",
    serialNumber: "EC-3091-B",
    lastMaintenance: "2026-08-20"
  },
  {
    id: "m-103",
    name: "Machine C (Pre-treatment & Curing Oven)",
    type: "Continuous Pre-treatment Tunnel",
    manufacturer: "ThermoHeat Industrial",
    model: "TH-OVEN-700",
    ratedCapacity: 150,
    capacityUnit: "Units/hr",
    powerRating: 75.0,
    ageYears: 4,
    status: "Active",
    serialNumber: "TH-7700-C",
    lastMaintenance: "2026-07-28"
  }
];

// 14 days of realistic daily operations entries for Machine A, B, C
export const INITIAL_OPERATIONS_LOGS = [
  {
    id: "op-101",
    date: "2026-08-29",
    machineId: "m-101",
    machineName: "Machine A (Automated Powder Coater)",
    runtimeHours: 7.0,
    downtimeHours: 1.0,
    plannedDowntimeHours: 0.2,
    actualOutput: 96,
    expectedOutput: 120,
    energyConsumedKwh: 295.0,
    scrapQuantityKg: 4.2,
    maintenanceFlag: false,
    downtimeReason: "Machine breakdown",
    notes: "Nozzle clog caused 45 mins stoppage."
  },
  {
    id: "op-102",
    date: "2026-08-29",
    machineId: "m-102",
    machineName: "Machine B (Spray Booth 2)",
    runtimeHours: 7.5,
    downtimeHours: 0.5,
    plannedDowntimeHours: 0.5,
    actualOutput: 78,
    expectedOutput: 80,
    energyConsumedKwh: 160.0,
    scrapQuantityKg: 2.1,
    maintenanceFlag: false,
    downtimeReason: "Maintenance",
    notes: "Routine filter change."
  },
  {
    id: "op-103",
    date: "2026-08-29",
    machineId: "m-103",
    machineName: "Machine C (Pre-treatment & Curing Oven)",
    runtimeHours: 8.0,
    downtimeHours: 0.0,
    plannedDowntimeHours: 0.0,
    actualOutput: 148,
    expectedOutput: 150,
    energyConsumedKwh: 580.0,
    scrapQuantityKg: 1.0,
    maintenanceFlag: false,
    downtimeReason: "None",
    notes: "Smooth continuous operation."
  },
  {
    id: "op-104",
    date: "2026-08-28",
    machineId: "m-101",
    machineName: "Machine A (Automated Powder Coater)",
    runtimeHours: 6.5,
    downtimeHours: 1.5,
    plannedDowntimeHours: 0.0,
    actualOutput: 88,
    expectedOutput: 120,
    energyConsumedKwh: 280.0,
    scrapQuantityKg: 5.5,
    maintenanceFlag: false,
    downtimeReason: "Power issue",
    notes: "Tripped circuit breaker twice."
  },
  {
    id: "op-105",
    date: "2026-08-28",
    machineId: "m-102",
    machineName: "Machine B (Spray Booth 2)",
    runtimeHours: 7.8,
    downtimeHours: 0.2,
    plannedDowntimeHours: 0.0,
    actualOutput: 81,
    expectedOutput: 80,
    energyConsumedKwh: 165.0,
    scrapQuantityKg: 1.8,
    maintenanceFlag: false,
    downtimeReason: "None",
    notes: "Slight over-performance."
  },
  {
    id: "op-106",
    date: "2026-08-27",
    machineId: "m-101",
    machineName: "Machine A (Automated Powder Coater)",
    runtimeHours: 7.2,
    downtimeHours: 0.8,
    plannedDowntimeHours: 0.3,
    actualOutput: 102,
    expectedOutput: 120,
    energyConsumedKwh: 300.0,
    scrapQuantityKg: 3.8,
    maintenanceFlag: false,
    downtimeReason: "Material shortage",
    notes: "Batch powder delivery delayed."
  }
];

export const INITIAL_ALERTS = [
  {
    id: "alt-201",
    severity: "Medium", // High, Medium, Low
    title: "Unusual Machine Performance — Machine A",
    machineId: "m-101",
    machineName: "Machine A",
    date: "2026-08-29",
    summary: "Output significantly below normal (96 vs 120 units) while runtime remained high (7.0 hrs).",
    whatHappened: "Machine A produced 96 units against an expected 120 units during 7 hours of operation.",
    metricChanged: "Actual Production Output (-20% variance)",
    normalVsAbnormal: "Normal hourly rate: ~16 units/hr | Observed rate: 13.7 units/hr",
    possibleFactors: [
      "High unplanned downtime due to nozzle clogging (1.0 hr)",
      "Powder feed pressure fluctuations",
      "Frequent manual restarts"
    ],
    acknowledged: false
  },
  {
    id: "alt-202",
    severity: "High",
    title: "High Energy Intensity Spurt — Machine C",
    machineId: "m-103",
    machineName: "Machine C",
    date: "2026-08-28",
    summary: "Energy per unit spiked to 3.92 kWh/unit (18% above monthly average).",
    whatHappened: "Pre-treatment oven consumed 580 kWh for 148 units output.",
    metricChanged: "Specific Energy Consumption",
    normalVsAbnormal: "Average: 3.3 kWh/unit | Current: 3.92 kWh/unit",
    possibleFactors: [
      "Oven door seal insulation wear",
      "Pre-heating cycle extended prior to shift start"
    ],
    acknowledged: false
  }
];

export const INITIAL_GROWTH_OPPORTUNITIES = [
  {
    id: "gro-301",
    title: "Reduce Unplanned Machine Downtime",
    category: "Operational Efficiency",
    currentMetric: "14 hrs/week total downtime across line",
    potentialImpact: "3–4 hrs/week downtime reduction",
    estimatedValue: "Potential capacity boost of +140 units/week",
    provenance: "Estimated",
    reason: "Machine A nozzle clogging & power trips account for 65% of total unplanned stoppage.",
    suggestedAction: "Implement daily pre-shift spray nozzle purging and voltage stabilizer check.",
    ctaRoute: "#/diagnosis"
  },
  {
    id: "gro-302",
    title: "Optimize Curing Oven Heat Retention",
    category: "Energy Management",
    currentMetric: "3.92 kWh per coated unit",
    potentialImpact: "10–12% energy cost reduction",
    estimatedValue: "Estimated ₹14,500 monthly savings",
    provenance: "Estimated",
    reason: "Pre-treatment oven heat leak during standby idle hours.",
    suggestedAction: "Replace silicon door gasket seals on Machine C and auto-dampen exhaust valves during breaks.",
    ctaRoute: "#/analytics"
  }
];

export const INITIAL_SYMBIOSIS_MATCHES = [
  {
    id: "sym-401",
    offeredMaterial: "Aluminium Scrap Shavings (Grade 6063)",
    quantity: "450 Kg/month",
    location: "Peenya Phase II (2.4 km away)",
    matchedPartner: "Karnataka Foundry Tech (Synthetic Partner)",
    matchScore: 94,
    compatibilityReason: "High purity aluminium waste matches partner's die-casting raw material needs.",
    status: "Potential Match"
  },
  {
    id: "sym-402",
    offeredMaterial: "Reclaimed Powder Coating Overspray (Epoxy Polyester)",
    quantity: "120 Kg/month",
    location: "Rajajinagar Industrial Estate (5.1 km away)",
    matchedPartner: "Apex Primer & Coatings (Synthetic Partner)",
    matchScore: 88,
    compatibilityReason: "Overspray powder can be re-blended into primer undercoat batches.",
    status: "Potential Match"
  }
];

export const INITIAL_MARKETPLACE_LISTINGS = [
  {
    id: "mkt-501",
    material: "Aluminium Fan Blade Cut-offs (Pure Grade)",
    quantity: 350,
    unit: "Kg",
    pricePerUnit: "₹185 / Kg",
    location: "Peenya, Bengaluru",
    availability: "Immediate",
    status: "Active",
    seller: "ABC Coating & Engineering Works",
    createdAt: "2026-08-25"
  },
  {
    id: "mkt-502",
    material: "Used Steel Drum Containers (200L Capacity)",
    quantity: 25,
    unit: "Units",
    pricePerUnit: "₹450 / Unit",
    location: "Peenya, Bengaluru",
    availability: "Available",
    status: "Active",
    seller: "ABC Coating & Engineering Works",
    createdAt: "2026-08-20"
  }
];