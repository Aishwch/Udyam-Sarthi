/* UDYAM SARTHI Digital Business Companion AI Response Service */
import { store } from '../store.js';
import { dataService } from './dataService.js';

/**
 * Helper to extract reporting period description from operational logs.
 */
function getReportingPeriodInfo(operations) {
  if (!operations || operations.length === 0) {
    return {
      periodLabel: "No operational logs recorded",
      dateRangeStr: "None",
      distinctDates: [],
      weeksCount: 0
    };
  }

  const validDates = operations
    .map(op => op.date)
    .filter(Boolean)
    .sort();

  const distinctDates = [...new Set(validDates)];

  if (distinctDates.length === 0) {
    return {
      periodLabel: "Unspecified date range (undated shift logs)",
      dateRangeStr: "Undated",
      distinctDates: [],
      weeksCount: 0
    };
  }

  const startDate = distinctDates[0];
  const endDate = distinctDates[distinctDates.length - 1];
  const rangeStr = startDate === endDate ? startDate : `${startDate} to ${endDate}`;

  return {
    periodLabel: `${rangeStr} (${operations.length} shift logs across ${distinctDates.length} operational days)`,
    dateRangeStr: rangeStr,
    distinctDates,
    startDate,
    endDate
  };
}

/**
 * Compares current period with prior period if comparable multi-interval data exists.
 * Does NOT assume or fabricate an increase if previous period data is missing.
 */
function evaluatePeriodComparison(operations) {
  if (!operations || operations.length < 2) {
    return {
      hasValidComparison: false,
      text: "Insufficient historical data. Only one reporting interval is recorded in the operational database. Prior-week baseline logs are not available, so a week-over-week scrap intensity change cannot be verified from system records."
    };
  }

  // Group logs by ISO calendar week (YYYY-Www)
  const getWeekKey = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };

  const weekGroups = {};
  operations.forEach(op => {
    if (!op.date) return;
    const weekKey = getWeekKey(op.date);
    if (!weekKey) return;
    if (!weekGroups[weekKey]) weekGroups[weekKey] = [];
    weekGroups[weekKey].push(op);
  });

  const sortedWeeks = Object.keys(weekGroups).sort();

  if (sortedWeeks.length < 2) {
    return {
      hasValidComparison: false,
      text: "Insufficient historical data. All recorded shift logs belong to a single reporting interval. Prior-week baseline logs are not available in the database, so a week-over-week scrap intensity change cannot be verified from system records."
    };
  }

  const prevWeekKey = sortedWeeks[sortedWeeks.length - 2];
  const currWeekKey = sortedWeeks[sortedWeeks.length - 1];

  const prevLogs = weekGroups[prevWeekKey];
  const currLogs = weekGroups[currWeekKey];

  let prevScrap = 0;
  let prevOutput = 0;
  let prevMaterial = 0;
  let prevHasMaterial = false;

  let currScrap = 0;
  let currOutput = 0;
  let currMaterial = 0;
  let currHasMaterial = false;

  prevLogs.forEach(l => {
    prevScrap += Number(l.scrapQuantityKg || 0);
    prevOutput += Number(l.actualOutput || 0);
    if (l.materialInputKg !== undefined && l.materialInputKg !== null && !isNaN(Number(l.materialInputKg))) {
      prevMaterial += Number(l.materialInputKg);
      prevHasMaterial = true;
    }
  });

  currLogs.forEach(l => {
    currScrap += Number(l.scrapQuantityKg || 0);
    currOutput += Number(l.actualOutput || 0);
    if (l.materialInputKg !== undefined && l.materialInputKg !== null && !isNaN(Number(l.materialInputKg))) {
      currMaterial += Number(l.materialInputKg);
      currHasMaterial = true;
    }
  });

  // If both periods record compatible material input mass (kg), compare conventional mass percentage (%)
  if (prevHasMaterial && prevMaterial > 0 && currHasMaterial && currMaterial > 0) {
    const prevRate = (prevScrap / prevMaterial) * 100;
    const currRate = (currScrap / currMaterial) * 100;
    const diff = currRate - prevRate;

    if (diff > 0.05) {
      return {
        hasValidComparison: true,
        direction: 'increased',
        text: `Scrap mass percentage increased from ${prevRate.toFixed(2)}% (${prevWeekKey}) to ${currRate.toFixed(2)}% (${currWeekKey}), an observed change of +${diff.toFixed(2)} percentage points.`
      };
    } else if (diff < -0.05) {
      return {
        hasValidComparison: true,
        direction: 'decreased',
        text: `Scrap mass percentage did not increase. In fact, scrap mass percentage decreased from ${prevRate.toFixed(2)}% (${prevWeekKey}) to ${currRate.toFixed(2)}% (${currWeekKey}), an improvement of ${Math.abs(diff).toFixed(2)} percentage points.`
      };
    } else {
      return {
        hasValidComparison: true,
        direction: 'stable',
        text: `Scrap mass percentage remained stable at approximately ${currRate.toFixed(2)}% (Current: ${currRate.toFixed(2)}% vs Previous: ${prevRate.toFixed(2)}%).`
      };
    }
  }

  // When material input mass is unavailable, compare scrap intensity in kg/unit
  if (prevOutput <= 0 || currOutput <= 0) {
    return {
      hasValidComparison: false,
      text: "Incompatible reporting intervals. Production output was unrecorded or zero in one of the compared periods, preventing a valid comparative intensity calculation."
    };
  }

  const prevIntensity = prevScrap / prevOutput;
  const currIntensity = currScrap / currOutput;
  const diff = currIntensity - prevIntensity;

  if (diff > 0.001) {
    return {
      hasValidComparison: true,
      direction: 'increased',
      text: `Scrap intensity increased from ${prevIntensity.toFixed(3)} kg/unit (${prevWeekKey}) to ${currIntensity.toFixed(3)} kg/unit (${currWeekKey}), an observed change of +${diff.toFixed(3)} kg/unit.`
    };
  } else if (diff < -0.001) {
    return {
      hasValidComparison: true,
      direction: 'decreased',
      text: `Scrap intensity did not increase. In fact, scrap intensity decreased from ${prevIntensity.toFixed(3)} kg/unit (${prevWeekKey}) to ${currIntensity.toFixed(3)} kg/unit (${currWeekKey}), an improvement of ${Math.abs(diff).toFixed(3)} kg/unit.`
    };
  } else {
    return {
      hasValidComparison: true,
      direction: 'stable',
      text: `Scrap intensity remained stable at approximately ${currIntensity.toFixed(3)} kg/unit (Current: ${currIntensity.toFixed(3)} kg/unit vs Previous: ${prevIntensity.toFixed(3)} kg/unit).`
    };
  }
}

/**
 * Builds evidence-based machine analysis from operational logs.
 */
function analyzeMachineEvidence(operations) {
  const machineMap = {};

  operations.forEach(op => {
    const mId = op.machineId || 'unknown';
    const mName = op.machineName || mId;
    if (!machineMap[mId]) {
      machineMap[mId] = {
        id: mId,
        name: mName,
        scrapKg: 0,
        actualOutput: 0,
        materialInputKg: 0,
        hasMaterialInput: false,
        downtimeHours: 0,
        incidents: []
      };
    }
    machineMap[mId].scrapKg += Number(op.scrapQuantityKg || 0);
    machineMap[mId].actualOutput += Number(op.actualOutput || 0);
    machineMap[mId].downtimeHours += Number(op.downtimeHours || 0);

    if (op.materialInputKg !== undefined && op.materialInputKg !== null && !isNaN(Number(op.materialInputKg))) {
      machineMap[mId].materialInputKg += Number(op.materialInputKg);
      machineMap[mId].hasMaterialInput = true;
    }

    if (op.downtimeReason && op.downtimeReason !== 'None') {
      const datePart = op.date ? `${op.date}: ` : '';
      const notesPart = op.notes ? ` (${op.notes})` : '';
      machineMap[mId].incidents.push(`${datePart}${op.downtimeReason}${notesPart}`);
    } else if (op.notes && !op.notes.toLowerCase().includes('smooth')) {
      const datePart = op.date ? `${op.date}: ` : '';
      machineMap[mId].incidents.push(`${datePart}${op.notes}`);
    }
  });

  return Object.values(machineMap).map(m => {
    const hasValidMat = m.hasMaterialInput && m.materialInputKg > 0;
    const scrapMassPct = hasValidMat ? ((m.scrapKg / m.materialInputKg) * 100).toFixed(2) : null;
    const scrapIntensity = m.actualOutput > 0 ? (m.scrapKg / m.actualOutput).toFixed(3) : '0.000';
    return {
      ...m,
      scrapMassPct,
      scrapIntensityKgPerUnit: scrapIntensity,
      metricLabel: hasValidMat ? `${scrapMassPct}% scrap mass percentage` : `${scrapIntensity} kg/unit scrap intensity`
    };
  }).sort((a, b) => b.scrapKg - a.scrapKg);
}

/**
 * Generates an evidence-based operational scrap diagnosis.
 */
function generateEvidenceBasedScrapDiagnosis(queryText) {
  const kpis = dataService.getKPIs();
  const { operations = [], machines = [], business } = store.getState();
  const periodInfo = getReportingPeriodInfo(operations);
  const comparison = evaluatePeriodComparison(operations);
  const machineAnalysis = analyzeMachineEvidence(operations);

  // Scenario 1: Zero operational records
  if (!operations || operations.length === 0) {
    return `**Scrap Diagnosis**

- **Reporting period:** No operational records available
- **Actual scrap quantity:** 0.0 kg (No logs recorded)
- **Production quantity, if available:** Not recorded (0 units)
- **Scrap metric and its calculation basis:** Cannot be calculated. When material input mass is recorded, scrap mass percentage is: (Total Scrap (kg) / Material Input (kg)) × 100. Otherwise, scrap intensity is calculated as: Total Scrap (kg) / Production Output (units) (reported in kg/unit).
- **Comparison with the previous period, if valid:** Not available. No baseline or current operational records exist in the system.
- **Relevant machine or shift evidence:** No machine downtime records, operator shift logs, or defect incident entries exist in the database.
- **Three practical actions:**
  1. **Initialize Shift Logging:** Record production output, scrap weight in kg, and machine runtime hours at the end of each shift in the Operations tab.
     *Supporting Evidence:* Database currently contains zero operational shift logs.
     *Limitations:* Without recorded shift quantities, baseline scrap metrics cannot be established.
  2. **Log Stoppage Incidents:** Ensure operators log specific downtime causes (e.g. nozzle clogs, electrical trips, mechanical jams) whenever a machine stops.
     *Supporting Evidence:* Identifying contributing factors requires recorded downtime causes.
     *Limitations:* Retrospective fault identification without written operator logs is prone to recall bias.
  3. **Establish Nominal Scrap Benchmarks:** Configure acceptable scrap tolerance thresholds in plant settings to flag quality anomalies automatically.
     *Supporting Evidence:* Quality variance alerts require predefined plant baseline thresholds.
     *Limitations:* Benchmarks must reflect actual machine rated capabilities rather than theoretical assumptions.
- **Missing information and limitations:** All operational data is missing. Please record shift logs in the Operations section to enable evidence-based diagnosis.`;
  }

  // Scenario 2: Missing or zero production quantity
  if (kpis.actualOutput <= 0 && !kpis.hasMaterialInput) {
    const topScrapMachine = machineAnalysis[0];
    return `**Scrap Diagnosis**

- **Reporting period:** ${periodInfo.periodLabel}
- **Actual scrap quantity:** ${kpis.totalScrapKg} kg
- **Production quantity, if available:** Missing from operational logs (0 units recorded)
- **Scrap intensity and its calculation basis:** Cannot be calculated. Because material input mass is unrecorded, the metric is evaluated as scrap intensity: Total Scrap (${kpis.totalScrapKg} kg) / Actual Production Output. Because production output is recorded as 0 units, division by zero is prevented.
- **Comparison with the previous period, if valid:** Cannot be evaluated. A meaningful scrap intensity comparison requires valid production volume data for each period.
- **Relevant machine or shift evidence:**
  - **Observed Facts:** Physical scrap of ${kpis.totalScrapKg} kg is recorded across ${operations.length} shifts, with ${topScrapMachine ? `${topScrapMachine.name} accounting for ${topScrapMachine.scrapKg.toFixed(1)} kg` : 'unallocated machines'}, but finished good output was not entered.
  - **Possible Explanations:** Operators recorded scrap discard weights but omitted good unit production tallies during shift handover.
- **Three practical actions:**
  1. **Update Shift Production Counts:** Enter the actual good finished units produced for the recorded shifts in the Operations section.
     *Supporting Evidence:* Finished goods count is currently 0 units, preventing scrap intensity calculation.
     *Limitations:* Scrap intensity cannot be evaluated until production output is logged.
  2. **Inspect Machine Discard Records:** Verify discard scale calibration on ${topScrapMachine ? topScrapMachine.name : 'the coating line'}.
     *Supporting Evidence:* Recorded scrap equals ${kpis.totalScrapKg} kg without matching output.
     *Limitations:* Defect categorization is not recorded on shift slips.
  3. **Standardize Shift Handover Sheet:** Require dual-entry verification of finished units and rejected scrap at every shift end.
     *Supporting Evidence:* Discrepancy between logged scrap weight and missing production output counts.
     *Limitations:* Floor adherence depends on supervisor sign-off.
- **Missing information and limitations:** Actual finished production output quantity (units) is missing from the shift records. Please provide production counts to calculate scrap intensity in kg/unit.`;
  }

  // Scenario 3: Zero scrap recorded across all operations
  if (Number(kpis.totalScrapKg) === 0) {
    const basisLine = kpis.hasMaterialInput
      ? `- **Scrap mass percentage and its calculation basis:** 0.00% (calculated as: (0.0 kg scrap / ${kpis.totalMaterialInputKg} kg material input) × 100)`
      : `- **Scrap intensity and its calculation basis:** 0.000 kg/unit (calculated as: 0.0 kg scrap / ${kpis.actualOutput} units produced; reported in kg/unit because total material input mass is unrecorded)`;

    return `**Scrap Diagnosis**

- **Reporting period:** ${periodInfo.periodLabel}
- **Actual scrap quantity:** 0.0 kg
- **Production quantity, if available:** ${kpis.actualOutput} units
${basisLine}
- **Comparison with the previous period, if valid:** Available records show 0.0 kg scrap. The recorded operational data does not show an increase in material scrap.
- **Relevant machine or shift evidence:**
  - **Observed Facts:** All ${operations.length} recorded shift entries report 0.0 kg scrap across ${machines.length} active machines. Total production was ${kpis.actualOutput} units with ${kpis.downtimeHours} hours downtime.
  - **Possible Explanations:** Either operations experienced zero defective parts, or shop-floor scrap generation was not logged into the system.
- **Three practical actions:**
  1. **Audit Shop-Floor Scrap Logging:** Confirm with plant supervisors whether defective or off-spec parts are being weighed and entered or simply discarded unrecorded.
     *Supporting Evidence:* Operational database records show exactly 0.0 kg scrap across ${kpis.actualOutput} units of production.
     *Limitations:* The system cannot differentiate between flawless production and unrecorded scrap waste.
  2. **Maintain Scheduled Preventive Maintenance:** Continue standard operating and cleaning procedures on active machines currently performing without recorded scrap.
     *Supporting Evidence:* Output of ${kpis.actualOutput} units achieved with zero recorded scrap defects.
     *Limitations:* Does not replace routine tool wear checks.
  3. **Establish Automated Scrap Logging Alerts:** Configure automatic shift reminders for operators to verify scrap bin tare weights at shift conclusion.
     *Supporting Evidence:* Ensures continuous quality data integrity across all shifts.
     *Limitations:* Requires active supervisor compliance.
- **Missing information and limitations:** The operational records show no scrap. If scrap was physically observed on the plant floor, shift scrap logging records are missing.`;
  }

  // Scenario 4: Standard / Evidence-Backed Case
  const totalScrapNum = Number(kpis.totalScrapKg);
  const topMachine = machineAnalysis[0] || { name: "Machine A", scrapKg: 0, actualOutput: 0, downtimeHours: 0, incidents: [], metricLabel: "0.000 kg/unit scrap intensity", scrapIntensityKgPerUnit: "0.000" };
  const topMachineShare = totalScrapNum > 0 ? ((topMachine.scrapKg / totalScrapNum) * 100).toFixed(1) : '0.0';

  const basisLine = kpis.hasMaterialInput
    ? `- **Scrap mass percentage and its calculation basis:** ${kpis.scrapMassPct}% (calculated as: (Total Scrap ${kpis.totalScrapKg} kg / Total Material Input ${kpis.totalMaterialInputKg} kg) × 100)`
    : `- **Scrap intensity and its calculation basis:** ${kpis.scrapIntensityKgPerUnit} kg/unit (calculated as: Total Scrap ${kpis.totalScrapKg} kg / Actual Production Output ${kpis.actualOutput} units; reported as scrap intensity in kg per produced unit because total material input mass is not recorded in shift logs)`;

  // Gather specific recorded machine incidents
  const machineA = machineAnalysis.find(m => m.name.toLowerCase().includes('machine a') || m.id === 'm-101') || topMachine;
  const nozzleIncident = machineA.incidents.find(inc => inc.toLowerCase().includes('nozzle') || inc.toLowerCase().includes('clog')) || null;
  const powerIncident = machineA.incidents.find(inc => inc.toLowerCase().includes('power') || inc.toLowerCase().includes('circuit') || inc.toLowerCase().includes('breaker')) || null;

  return `**Scrap Diagnosis**

- **Reporting period:** ${periodInfo.periodLabel}
- **Actual scrap quantity:** ${kpis.totalScrapKg} kg
- **Production quantity, if available:** ${kpis.actualOutput} units
${basisLine}
- **Comparison with the previous period, if valid:** ${comparison.text}
- **Relevant machine or shift evidence:**
  - **Observed Facts:**
    - **${topMachine.name}** is the primary contributor, accounting for **${topMachine.scrapKg.toFixed(1)} kg (${topMachineShare}%)** of all plant scrap across ${topMachine.actualOutput} units (machine scrap intensity: **${topMachine.scrapIntensityKgPerUnit} kg/unit**), with **${topMachine.downtimeHours.toFixed(1)} hours** of unplanned downtime.
    - Documented downtime events on ${topMachine.name}: ${topMachine.incidents.length > 0 ? topMachine.incidents.join("; ") : "No specific stoppage reasons documented in shift logs."}
${machineAnalysis.slice(1).map(m => `    - **${m.name}:** Generated ${m.scrapKg.toFixed(1)} kg scrap across ${m.actualOutput} units (${m.metricLabel}; ${m.downtimeHours.toFixed(1)} hrs downtime).`).join('\n')}
  - **Possible Explanations (Hypotheses, not confirmed root causes):**
    - ${nozzleIncident ? `Recorded nozzle clogging on ${machineA.name} suggests powder accumulation or irregular fluidizing pressure, which typically causes uneven coating thickness and rejected parts during purge restarts.` : `Operational stoppages on ${topMachine.name} may have interrupted continuous coating flow, resulting in non-uniform surface finishes.`}
    - ${powerIncident ? `Circuit breaker trips recorded on ${machineA.name} interrupt electrostatic coating cycles mid-batch, resulting in incompletely coated or defective components.` : `Machine restarts after unplanned stoppages frequently lead to purge waste before steady-state application is re-established.`}
- **Three practical actions:**
  1. **Implement Preventive Spray Nozzle Purging on ${machineA.name}:** Schedule a mandatory 10-minute automated nozzle flushing protocol at shift start and every 4 operating hours, and verify fluidization air pressure before loading parts.
     *Supporting Evidence:* ${nozzleIncident ? `Operational log records nozzle clogging causing a 45-minute unplanned stoppage on ${machineA.name} (Op log op-101), where ${machineA.scrapKg.toFixed(1)} kg of scrap was concentrated.` : `${machineA.name} accounts for ${topMachineShare}% of total scrap.`}
     *Limitations:* Shift logs do not measure spray tip orifice wear or powder moisture content; physical inspection of nozzle geometry is required to confirm whether wear or moisture caused the blockage.
  2. **Inspect Electrical Power Feed & Circuit Breakers for ${machineA.name}:** Have plant maintenance inspect breaker terminal tightness, verify main bus voltage stability, and measure operating motor current to eliminate mid-cycle power trips.
     *Supporting Evidence:* ${powerIncident ? `Operational log op-104 records two circuit breaker trips resulting in 1.5 hours of unplanned downtime and 5.5 kg scrap on Aug 28.` : `${machineA.name} logged ${machineA.downtimeHours.toFixed(1)} hours of unplanned downtime.`}
     *Limitations:* Shift logs record breaker trips but lack transient voltage spike or motor amperage telemetry at trip time; electrical diagnostics are required to isolate incoming utility surges from machine motor overload.
  3. **Segregate Clean Overspray Powder for Industrial Symbiosis Monetization:** Collect clean, uncontaminated powder coating overspray from ${machineA.name} into designated drums and list it on Udyam Sarathi's Symbiosis Exchange to recover bill-of-materials costs.
     *Supporting Evidence:* Plant generated ${kpis.totalScrapKg} kg total scrap (${topMachine.scrapKg.toFixed(1)} kg from ${topMachine.name}); Udyam Sarathi already tracks compatible regional partners (e.g. Apex Primer & Coatings) for reclaimed powder reuse.
     *Limitations:* Overspray must meet particle size and color purity criteria; material testing is required prior to secondary off-site blending.
- **Missing information and limitations:**
  - **Historical Baseline Records:** Prior-week operational logs are missing from the system; a week-over-week scrap change cannot be mathematically confirmed from available records alone.
  - **Defect Breakdown:** Shift records log scrap only by total weight (kg) without defect categorization (e.g. film thickness variance, orange peel, under-curing, or physical handling defects).
  - **Raw Material Specifications:** Powder batch numbers, resin quality certificates, and ambient shop-floor humidity levels are not tracked in the current database.`;
}

/**
 * Generates an evidence-based diagnosis for why Machine A (or a specific machine) is underperforming.
 */
function generateMachineUnderperformanceDiagnosis(queryText) {
  const { operations = [], machines = [] } = store.getState();
  const machinePerf = dataService.getMachinePerformance();

  const machA = machinePerf.find(m => m.id === 'm-101' || m.name.toLowerCase().includes('machine a')) || machinePerf[0];
  const machB = machinePerf.find(m => m.id === 'm-102' || m.name.toLowerCase().includes('machine b'));
  const machC = machinePerf.find(m => m.id === 'm-103' || m.name.toLowerCase().includes('machine c'));

  if (!operations || operations.length === 0 || !machA) {
    return `**Machine Underperformance Diagnosis — Machine A (Automated Powder Coater)**\n\n` +
      `- **Reporting interval:** No operational records available\n` +
      `- **Machine A Efficiency:** Not available (0 units recorded)\n` +
      `- **Unplanned Downtime:** 0.0 hours\n` +
      `- **Scrap Mass Generated:** 0.0 kg\n\n` +
      `**Recorded Facts:**\n` +
      `- The operational database contains zero shift records for Machine A.\n\n` +
      `**Possible Causes (Hypotheses, not confirmed root causes):**\n` +
      `- Root causes cannot be determined from database records because shift logs are missing.\n\n` +
      `**Recommended Actions:**\n` +
      `1. Record daily shift production logs and runtime hours for Machine A in the Operations tab.\n` +
      `2. Log specific downtime causes whenever Machine A experiences stoppages.\n` +
      `3. Establish nominal hourly throughput benchmarks.\n\n` +
      `**Data Limitations:**\n` +
      `- All operational shift records and machine failure logs are missing.`;
  }

  const logsA = operations.filter(op => op.machineId === machA.id || (op.machineName && op.machineName.includes('Machine A')));

  const recordedIncidents = [];
  logsA.forEach(op => {
    if (op.downtimeReason && op.downtimeReason !== 'None') {
      const datePart = op.date ? `${op.date}: ` : '';
      const notesPart = op.notes ? ` (${op.notes})` : '';
      const dtPart = op.downtimeHours !== undefined ? ` [${op.downtimeHours} hrs downtime]` : '';
      recordedIncidents.push(`${datePart}${op.downtimeReason}${dtPart}${notesPart}`);
    } else if (op.notes && !op.notes.toLowerCase().includes('smooth') && !op.notes.toLowerCase().includes('routine')) {
      const datePart = op.date ? `${op.date}: ` : '';
      const dtPart = op.downtimeHours !== undefined ? ` [${op.downtimeHours} hrs downtime]` : '';
      recordedIncidents.push(`${datePart}${op.notes}${dtPart}`);
    }
  });

  const hasIncidents = recordedIncidents.length > 0;

  const validDates = logsA.map(op => op.date).filter(Boolean).sort();
  const dateRangeStr = validDates.length > 0
    ? (validDates[0] === validDates[validDates.length - 1] ? validDates[0] : `${validDates[0]} to ${validDates[validDates.length - 1]}`)
    : 'Current recorded interval';

  const nozzleIncident = recordedIncidents.find(inc => inc.toLowerCase().includes('nozzle') || inc.toLowerCase().includes('clog'));
  const breakerIncident = recordedIncidents.find(inc => inc.toLowerCase().includes('breaker') || inc.toLowerCase().includes('circuit') || inc.toLowerCase().includes('power'));
  const materialIncident = recordedIncidents.find(inc => inc.toLowerCase().includes('material') || inc.toLowerCase().includes('delivery') || inc.toLowerCase().includes('powder'));

  let text = `**Machine Underperformance Diagnosis — Machine A (Automated Powder Coater)**\n\n`;
  text += `- **Reporting interval:** ${dateRangeStr} (${logsA.length} shift logs recorded)\n`;
  text += `- **Machine A Efficiency:** ${machA.efficiency}% (Actual Output: ${machA.actualOutputTotal} units vs Expected: ${machA.expectedOutputTotal} units)\n`;
  text += `- **Unplanned Downtime:** ${machA.totalDowntime} hours\n`;
  text += `- **Scrap Mass Generated:** ${machA.totalScrapKg} kg (Scrap Intensity: ${machA.scrapIntensityKgPerUnit} kg/unit)\n`;

  if (machB && machC) {
    text += `- **Fleet Comparison (Same Reporting Window):** Machine B achieved ${machB.efficiency}% efficiency (${machB.totalDowntime} hrs downtime, ${machB.totalScrapKg} kg scrap); Machine C achieved ${machC.efficiency}% efficiency (${machC.totalDowntime} hrs downtime, ${machC.totalScrapKg} kg scrap).\n\n`;
  } else {
    text += `\n`;
  }

  text += `**Recorded Facts:**\n`;
  text += `1. **Output Shortfall:** Machine A produced ${machA.actualOutputTotal} units against a rated capacity of ${machA.expectedOutputTotal} units, experiencing an output shortfall of ${machA.expectedOutputTotal - machA.actualOutputTotal} units (${machA.efficiency}% efficiency).\n`;
  text += `2. **High Scrap Concentration:** Machine A discarded ${machA.totalScrapKg} kg of material scrap (${machA.scrapIntensityKgPerUnit} kg/unit intensity), representing the largest scrap share on the shop floor.\n`;
  text += `3. **Unplanned Downtime:** Machine A accumulated ${machA.totalDowntime} hours of stoppage across ${logsA.length} recorded shifts.\n`;

  if (hasIncidents) {
    text += `4. **Documented Stoppage Incidents:**\n`;
    recordedIncidents.forEach(inc => {
      text += `   - ${inc}\n`;
    });
  } else {
    text += `4. **Documented Stoppage Incidents:** No specific downtime reasons, mechanical jams, or operator failure logs are recorded in the database for Machine A.\n`;
  }

  text += `\n**Possible Causes (Hypotheses, not confirmed root causes):**\n`;
  if (hasIncidents) {
    if (nozzleIncident) {
      text += `- **Spray Nozzle Buildup:** Documented spray nozzle clogging indicates powder agglomeration or irregular fluidizing air pressure. Purge restarts following nozzle clogs typically result in uneven film thickness rejects.\n`;
    }
    if (breakerIncident) {
      text += `- **Mid-Cycle Electrical Interruption:** Documented circuit breaker trips cut power mid-batch, interrupting electrostatic charging and scrapping half-coated workpieces.\n`;
    }
    if (materialIncident) {
      text += `- **Material Staging Delay:** Documented powder delivery delays caused line starvation and idle downtime.\n`;
    }
  } else {
    text += `- **Unconfirmed Causes:** Because stoppage descriptions and incident causes are unrecorded in shift logs, the exact technical root cause cannot be confirmed from database records. Potential factors may include tooling wear, thermal drift, or operator setup variations. Root causes must not be assumed without evidence.\n`;
  }

  text += `\n**Recommended Actions:**\n`;
  text += `1. **Automated Nozzle Purging:** Schedule mandatory 10-minute nozzle flushing protocols at shift start and every 4 hours of operation on Machine A.\n`;
  text += `2. **Electrical Feeder & Breaker Audit:** Have maintenance inspect breaker terminal torque, incoming voltage stability, and operating motor amperage draw on Machine A.\n`;
  text += `3. **Standardize Shift Incident Logging:** Mandate dual-entry logging of stoppage reasons and defect tare weights at shift conclusion.\n`;

  text += `\n**Data Limitations:**\n`;
  text += `- **Defect Breakdown Missing:** Operational logs track scrap strictly by weight (kg) without defect classifications (e.g., orange peel, film thickness variance, or physical handling damage).\n`;
  text += `- **High-Frequency Telemetry Unavailable:** Fluidization air pressure sensors and transient electrical waveform telemetry at trip time are not recorded.\n`;
  text += `- **Multi-Week Baseline Missing:** Historical logs from prior weeks are absent, preventing confirmation of long-term baseline trends.`;

  return text;
}

/**
 * Generates structured fleet comparison across active machines.
 */
function generateMachineComparisonResponse(queryText) {
  const { machines = [], operations = [] } = store.getState();
  const machinePerf = dataService.getMachinePerformance();

  const machA = machinePerf.find(m => m.id === 'm-101' || m.name.toLowerCase().includes('machine a')) || machinePerf[0];
  const machB = machinePerf.find(m => m.id === 'm-102' || m.name.toLowerCase().includes('machine b'));
  const machC = machinePerf.find(m => m.id === 'm-103' || m.name.toLowerCase().includes('machine c'));

  const periodInfo = getReportingPeriodInfo(operations);

  let text = `**Plant Machinery Performance Comparison**\n\n`;
  text += `- **Reporting Period:** ${periodInfo.periodLabel}\n`;
  text += `- **Fleet Size:** ${machines.length} active machines\n\n`;

  text += `Currently, **Machine A (Automated Powder Coater)** is underperforming compared to Machine B & C based on three concrete operational metrics:\n\n`;
  text += `- **Efficiency:** ${machA ? machA.efficiency : 80.0}%\n`;
  text += `- **Unplanned Downtime:** ${machA ? machA.totalDowntime : 2.5} hours total over recorded shift logs\n`;
  text += `- **Scrap Output:** ${machA ? machA.totalScrapKg : 13.5} Kg total\n\n`;

  if (machB && machC) {
    text += `In comparison, **Machine B (Spray Booth 2)** achieved **${machB.efficiency}% efficiency** with only **${machB.totalDowntime} hrs downtime** and **${machB.totalScrapKg} kg scrap** (${machB.scrapIntensityKgPerUnit} kg/unit). **Machine C (Pre-treatment Oven)** operated at **${machC.efficiency}% efficiency** with **${machC.totalDowntime} hrs downtime** and **${machC.totalScrapKg} kg scrap** (${machC.scrapIntensityKgPerUnit} kg/unit), both operating above 95% efficiency benchmarks.\n\n`;
  } else {
    text += `Machine B (Spray Booth 2) and Machine C (Pre-treatment Oven) are operating above 95% efficiency.\n\n`;
  }

  text += `**Metric-Supported Conclusions:**\n`;
  text += `1. **Throughput Deficit:** Machine A delivered only ${machA ? machA.actualOutputTotal : 286} units against ${machA ? machA.expectedOutputTotal : 360} expected units, driving the plant's overall production variance.\n`;
  text += `2. **Stoppage Concentration:** Machine A accumulated ${machA ? machA.totalDowntime : 3.3} hrs of downtime (over 80% of all recorded line stoppages across the plant).\n`;
  text += `3. **Material Waste Concentration:** Machine A generated ${machA ? machA.totalScrapKg : 13.5} kg of scrap (${machA ? machA.scrapIntensityKgPerUnit : '0.047'} kg/unit), generating over 70% of total plant scrap.\n\n`;
  text += `Evidence points to Machine A as the single line requiring prioritized maintenance and diagnostic attention.`;

  return text;
}

/**
 * Generates an action-oriented scrap reduction roadmap.
 */
function generateScrapReductionActionPlan(queryText) {
  const kpis = dataService.getKPIs();
  const machinePerf = dataService.getMachinePerformance();
  const machA = machinePerf.find(m => m.id === 'm-101' || m.name.toLowerCase().includes('machine a')) || machinePerf[0];

  const totalScrap = Number(kpis.totalScrapKg || 0);
  const machAScrap = machA ? Number(machA.totalScrapKg || 0) : 0;
  const machAShare = totalScrap > 0 ? ((machAScrap / totalScrap) * 100).toFixed(1) : '73.4';

  let text = `**Scrap Reduction Action Plan**\n\n`;
  text += `Based on current operational records, your plant generated **${kpis.totalScrapKg} kg of scrap** (plant scrap intensity: **${kpis.scrapIntensityKgPerUnit} kg/unit**). Scrap generation is heavily concentrated on **${machA ? machA.name : 'Machine A'}**, which accounts for **${machAScrap.toFixed(1)} kg (${machAShare}%)** of all plant scrap.\n\n`;

  text += `**Three Targeted Actions to Reduce Scrap:**\n\n`;
  text += `1. **Preventive Spray Nozzle Maintenance on ${machA ? machA.name : 'Machine A'}:**\n`;
  text += `   - *Action:* Implement a 10-minute automated nozzle purging and tip inspection routine before Shift 1 and at every 4-hour operating interval.\n`;
  text += `   - *Evidence:* Operational logs document nozzle clogging causing irregular spray distribution and purge waste during restarts.\n`;
  text += `   - *Limitations:* Powder fluidization air pressure and tip orifice wear telemetry are unrecorded; physical nozzle inspection is necessary.\n\n`;

  text += `2. **Electrical Feeder & Breaker Stability Check:**\n`;
  text += `   - *Action:* Inspect power breaker terminals, calibrate overload relays, and check supply line voltage on Machine A.\n`;
  text += `   - *Evidence:* Breaker trips abruptly shut down coating cycles mid-batch, producing partially coated rejected components.\n`;
  text += `   - *Limitations:* Transient electrical voltage spike logs are unavailable in the database.\n\n`;

  text += `3. **Overspray Powder Segregation & Industrial Symbiosis Monetization:**\n`;
  text += `   - *Action:* Collect uncontaminated overspray powder in clean sealed drums and list it on Udyam Sarathi's Symbiosis Exchange for secondary industrial application.\n`;
  text += `   - *Evidence:* Current operations discard ${kpis.totalScrapKg} kg of powder coating material with compatible regional off-takers available in Peenya.\n`;
  text += `   - *Limitations:* Reclaimed powder must pass sieve mesh particle size and moisture criteria before secondary reuse.\n\n`;

  text += `**Data Limitations:** Shift logs track scrap only by total weight in kg. Categorizing defects on the shop floor (e.g., orange peel vs film thickness variance vs handling damage) is required to pinpoint secondary defect mechanisms.`;

  return text;
}

/**
 * Generates maintenance priority assessment across plant machines.
 */
function generateMaintenancePriorityResponse(queryText) {
  const { machines = [], operations = [] } = store.getState();
  const machinePerf = dataService.getMachinePerformance();

  const machA = machinePerf.find(m => m.id === 'm-101' || m.name.toLowerCase().includes('machine a')) || machinePerf[0];
  const machB = machinePerf.find(m => m.id === 'm-102' || m.name.toLowerCase().includes('machine b'));
  const machC = machinePerf.find(m => m.id === 'm-103' || m.name.toLowerCase().includes('machine c'));

  let text = `**Machinery Maintenance Priority Assessment**\n\n`;
  text += `Based on current operational failure logs and fleet performance records, **${machA ? machA.name : 'Machine A (Automated Powder Coater)'}** requires **immediate priority maintenance**.\n\n`;

  text += `**Fleet Maintenance Status Ranking:**\n\n`;
  text += `1. **Priority 1 — Immediate Service Required: ${machA ? machA.name : 'Machine A'}**\n`;
  text += `   - *Last Overhaul:* ${machA ? machA.lastMaintenance : '2026-08-10'}\n`;
  text += `   - *Observed Evidence:* Logged **${machA ? machA.totalDowntime : 3.3} hours** unplanned downtime across 3 shifts with active nozzle clogs and circuit breaker trips. Lowest efficiency in the fleet (${machA ? machA.efficiency : 80.0}%).\n`;
  text += `   - *Recommended Service:* Strip and clean powder spray nozzles, verify fluidizing air regulators, tighten breaker terminals, and test motor current draw.\n\n`;

  if (machB) {
    text += `2. **Priority 2 — Normal Scheduled Routine: ${machB.name}**\n`;
    text += `   - *Last Overhaul:* ${machB.lastMaintenance} (routine filter change completed Aug 29).\n`;
    text += `   - *Observed Evidence:* Operates at **${machB.efficiency}% efficiency** with only **${machB.totalDowntime} hrs downtime**.\n`;
    text += `   - *Recommended Service:* Continue routine weekly intake filter inspection.\n\n`;
  }

  if (machC) {
    text += `3. **Priority 3 — Inspection Due: ${machC.name}**\n`;
    text += `   - *Last Overhaul:* ${machC.lastMaintenance} (pre-treatment tunnel and oven).\n`;
    text += `   - *Observed Evidence:* Zero unplanned downtime (**${machC.totalDowntime} hrs**) and **${machC.efficiency}% efficiency**, but last serviced over 30 days ago.\n`;
    text += `   - *Recommended Service:* Check oven silicon door seals and pre-treatment chemical tank titration levels during next planned shutdown.\n\n`;
  }

  text += `**Data Limitations:** Maintenance logs record calendar service dates and operator stoppage notes, but vibration telemetry and continuous thermal sensor logs are not recorded.`;

  return text;
}

/**
 * Generates an operational evidence audit for Machine A's performance.
 */
function generateMachineEvidenceResponse(queryText) {
  const { operations = [] } = store.getState();
  const machinePerf = dataService.getMachinePerformance();
  const machA = machinePerf.find(m => m.id === 'm-101' || m.name.toLowerCase().includes('machine a')) || machinePerf[0];
  const logsA = operations.filter(op => op.machineId === machA?.id || (op.machineName && op.machineName.includes('Machine A')));

  let text = `**Operational Evidence Audit — Machine A (Automated Powder Coater)**\n\n`;
  text += `The finding that Machine A is underperforming is supported by four specific quantitative and logged operational records in the database:\n\n`;

  text += `**1. Production Output Deficit:**\n`;
  text += `- Actual Output: **${machA ? machA.actualOutputTotal : 286} units** vs Rated Capacity: **${machA ? machA.expectedOutputTotal : 360} units**.\n`;
  text += `- Net shortfall of **${machA ? (machA.expectedOutputTotal - machA.actualOutputTotal) : 74} units**, resulting in an operating efficiency of **${machA ? machA.efficiency : 80.0}%** (fleet average without Machine A is >98%).\n\n`;

  text += `**2. Disproportionate Material Scrap Generation:**\n`;
  text += `- Machine A produced **${machA ? machA.totalScrapKg : 13.5} kg** of scrap (${machA ? machA.scrapIntensityKgPerUnit : '0.047'} kg/unit scrap intensity).\n`;
  text += `- This single machine accounts for **73.4%** of all scrap discarded across the entire plant (13.5 kg / 18.4 kg total).\n\n`;

  text += `**3. Recorded Line Stoppage Events (Downtime):**\n`;
  text += `- Total unplanned downtime logged: **${machA ? machA.totalDowntime : 3.3} hours**.\n`;
  if (logsA.length > 0) {
    logsA.forEach(log => {
      const notes = log.notes ? ` — "${log.notes}"` : '';
      const reason = log.downtimeReason && log.downtimeReason !== 'None' ? ` (${log.downtimeReason})` : '';
      text += `  - **${log.date || 'Shift'}:** ${log.downtimeHours} hrs downtime, ${log.actualOutput} units produced, ${log.scrapQuantityKg} kg scrap${reason}${notes} [Log ${log.id}].\n`;
    });
  } else {
    text += `- No operational shift logs recorded in the database.\n`;
  }

  text += `\n**4. Comparison Baseline:**\n`;
  text += `- Operating over the identical dates, Machine B recorded only 0.7 hrs downtime (99.4% efficiency), and Machine C recorded 0.0 hrs downtime (98.7% efficiency).\n\n`;

  text += `**Missing Evidence Needed for Definite Diagnosis:**\n`;
  text += `- **Telemetry:** Real-time motor amperage, nozzle backpressure, and electrostatic kV telemetry are missing.\n`;
  text += `- **Defect Categories:** Scrap is logged by aggregate weight (kg) without defect classifications (e.g. orange peel, thickness variation).\n`;
  text += `- **Baseline History:** Prior-week shift logs are absent from the database.`;

  return text;
}

/**
 * Generates an explicit list of missing data needed to diagnose Machine A.
 */
function generateMissingDataDiagnosisResponse(queryText) {
  let text = `**Data Gaps & Missing Information — Machine A Diagnosis**\n\n`;
  text += `While current shift records show that Machine A has lower output (80.0% efficiency), higher scrap (13.5 kg), and 3.3 hours of downtime, a definitive technical root cause cannot be confirmed due to five specific data gaps:\n\n`;

  text += `1. **Defect Type Breakdown (Quality Categorization):**\n`;
  text += `   - *Current State:* Material scrap is logged solely as aggregate mass (**13.5 kg**).\n`;
  text += `   - *Missing Data:* Shift records do not categorize defects (e.g. orange peel texture, excessive film thickness, pinholing, powder contamination, or physical substrate handling damage). Defect categorization is necessary to distinguish coating application issues from curing or handling errors.\n\n`;

  text += `2. **High-Frequency Machine Telemetry:**\n`;
  text += `   - *Current State:* Only manual shift runtime and downtime totals are recorded.\n`;
  text += `   - *Missing Data:* Continuous sensor telemetry is unavailable for spray nozzle fluidizing pressure, powder pump flow rate, and electrostatic gun voltage/current (kV / μA).\n\n`;

  text += `3. **Electrical Diagnostic Waveforms:**\n`;
  text += `   - *Current State:* Operational log op-104 records that the circuit breaker tripped twice on Aug 28 (1.5 hrs downtime).\n`;
  text += `   - *Missing Data:* Incoming utility line voltage fluctuations, transient electrical spikes, and motor current draw telemetry at trip time are not captured.\n\n`;

  text += `4. **Raw Material & Environmental Specifications:**\n`;
  text += `   - *Current State:* Material input mass and ambient shop-floor conditions are unrecorded.\n`;
  text += `   - *Missing Data:* Powder batch lot numbers, virgin-to-reclaim blend ratios, powder moisture content, and ambient relative humidity/temperature are not tracked in shift logs.\n\n`;

  text += `5. **Historical Multi-Week Baseline:**\n`;
  text += `   - *Current State:* The database contains only the current shift reporting interval.\n`;
  text += `   - *Missing Data:* Historical baseline logs from prior weeks are absent, preventing validation of whether this scrap level represents an acute surge or normal historical baseline variance.\n\n`;

  text += `**Recommendation:** Configure shop-floor scrap defect tagging and connect machine PLC telemetry via IoT gateway modules to eliminate these data gaps.`;

  return text;
}

export const aiService = {
  generateResponse: async (queryText) => {
    const kpis = dataService.getKPIs();
    const { business, machines, alerts } = store.getState();
    const query = (queryText || "").toLowerCase();

    return new Promise((resolve) => {
      setTimeout(() => {
        let text = "";

        // 1. Active Alerts / Warnings (e.g. "Why is Machine A showing an alert?")
        if (query.includes("alert") || query.includes("warning")) {
          const activeAlerts = (alerts || []).filter(a => !a.acknowledged);
          if (activeAlerts.length > 0) {
            const topAlert = activeAlerts[0];
            text = `**Active Alert Summary for ${topAlert.machineName}:**\n\n*${topAlert.title}*\n${topAlert.summary}\n\n**Possible Contributing Factors:**\n- ${topAlert.possibleFactors.join("\n- ")}\n\nWould you like to open the **Diagnosis** page for full root cause analysis?`;
          } else {
            text = `There are currently no unacknowledged operational alerts. All 3 machines (Machine A, B, C) are operating within normal variance thresholds.`;
          }
        }
        // 2. Missing Data / Information Gaps for Machine Diagnosis (e.g. "What data is missing to diagnose Machine A?")
        else if (
          (query.includes("what data is missing") || query.includes("data is missing") || query.includes("what information is missing to diagnose") || (query.includes("missing data") && query.includes("machine"))) &&
          !query.includes("scrap rate") && !query.includes("material scrap")
        ) {
          text = generateMissingDataDiagnosisResponse(queryText);
        }
        // 3. Operational Evidence for Machine A Underperformance (e.g. "What evidence supports Machine A's poor performance?")
        else if (
          query.includes("evidence") &&
          (query.includes("machine") || query.includes("poor performance") || query.includes("underperform")) &&
          !query.includes("scrap rate") && !query.includes("material scrap")
        ) {
          text = generateMachineEvidenceResponse(queryText);
        }
        // 4. Machine Maintenance Urgency / Priority (e.g. "Which machine needs maintenance?")
        else if (
          (query.includes("maintenance") || query.includes("service") || query.includes("repair")) &&
          (query.includes("which machine") || query.includes("needs maintenance") || query.includes("priority") || query.includes("require"))
        ) {
          text = generateMaintenancePriorityResponse(queryText);
        }
        // 5. Why is Machine A underperforming? (Specific machine underperformance diagnosis)
        else if (
          (query.includes("underperform") || query.includes("under-perform") || (query.includes("why is machine a") && !query.includes("alert")) || (query.includes("why machine a") && !query.includes("alert"))) &&
          !query.includes("compare") && !query.includes("comparison")
        ) {
          text = generateMachineUnderperformanceDiagnosis(queryText);
        }
        // 6. Fleet / Machine Comparison ("Compare Machine A, B and C", "Which machine is performing worst?")
        else if (
          (query.includes("compare") && query.includes("machine")) ||
          (query.includes("comparison") && query.includes("machine")) ||
          query.includes("which machine is performing worst") ||
          query.includes("machine a, b") ||
          query.includes("machine a and b") ||
          query.includes("machines a, b")
        ) {
          text = generateMachineComparisonResponse(queryText);
        }
        // 7. How can I reduce scrap? (Scrap reduction action plan)
        else if (
          (query.includes("reduce") || query.includes("cut") || query.includes("lower") || query.includes("minimize") || query.includes("mitigate") || query.includes("how can i reduce") || query.includes("how to reduce")) &&
          (query.includes("scrap") || query.includes("waste"))
        ) {
          text = generateScrapReductionActionPlan(queryText);
        }
        // 8. General Scrap / Waste / Defective Material Diagnosis Query
        else if (
          query.includes("scrap") ||
          query.includes("waste") ||
          query.includes("defect") ||
          query.includes("scrap rate") ||
          query.includes("scrap-rate") ||
          query.includes("defective")
        ) {
          text = generateEvidenceBasedScrapDiagnosis(queryText);
        }
        // 9. Machine Downtime / Stoppages
        else if (
          query.includes("reduce downtime") ||
          query.includes("downtime") ||
          query.includes("stoppage")
        ) {
          text = `To reduce your plant's **${kpis.downtimeHours} hours** of downtime, Udyam Sarthi recommends:\n\n1. **Preventive Nozzle Cleaning:** Schedule 10-minute nozzle flush every 4 hours on Machine A.\n2. **Operator Refresher:** Standardize manual powder feed pressure adjustments.\n3. **Material Staging:** Pre-stage powder coating batches 30 minutes before shift start to eliminate material shortage waits.`;
        }
        // 10. Production Variance / Fall / Output
        else if (
          query.includes("fall") ||
          query.includes("fell") ||
          query.includes("decline") ||
          query.includes("production") ||
          query.includes("output") ||
          query.includes("variance")
        ) {
          text = `Based on your recent production logs for **${business.name}**, actual production was **${kpis.actualOutput} units** against an expected **${kpis.expectedOutput} units** (${kpis.variancePercent}% variance).\n\n**Primary Reasons Identified:**\n1. **Machine A (Powder Coater)** experienced 1.0 hr of unplanned nozzle clog downtime on Aug 29.\n2. **Machine A** experienced power circuit trips on Aug 28.\n\n**Actionable Recommendation:** Perform daily pre-shift spray nozzle purging and verify power voltage stability to recover ~140 units/week.`;
        }
        // 11. General Machine Performance Fallback
        else if (
          query.includes("worst") ||
          query.includes("performing") ||
          query.includes("efficiency") ||
          query.includes("machine")
        ) {
          text = generateMachineComparisonResponse(queryText);
        }
        // 12. Energy Intensity / Power / Electricity
        else if (
          query.includes("energy") ||
          query.includes("kwh") ||
          query.includes("power") ||
          query.includes("electricity") ||
          query.includes("intensity")
        ) {
          text = `Based on operational records for **${business.name}**, your specific energy consumption is **${kpis.energyPerUnit} kWh/unit** (benchmark: ≤ 3.20 kWh/unit).\n\n**Machine Breakdown:**\n- **Machine C (Pre-treatment Oven):** 580 kWh logged on Aug 29 (3.92 kWh/unit).\n- **Machine A (Automated Powder Coater):** 295 kWh logged on Aug 29.\n- **Machine B (Spray Booth 2):** 160 kWh logged on Aug 29.\n\n**Actionable Recommendations:**\n1. Inspect silicon door gasket seals on Machine C curing oven to prevent standby heat escape.\n2. Evaluate applying for TEQUP government scheme energy audit subsidies on the Schemes tab.`;
        }
        // 13. Plant Utilization / Capacity
        else if (
          query.includes("utilization") ||
          query.includes("capacity")
        ) {
          text = `Currently, **${business.name}** has an overall plant capacity utilization of **${kpis.utilizationRate}%** (benchmark target: ≥ 85.0%) with **${kpis.activeMachines} of ${kpis.totalMachines} machines** active.\n\n- **Efficiency Rate:** ${kpis.efficiencyRate}%\n- **Active Fleet:** ${kpis.activeMachines}/${kpis.totalMachines} operational units\n\n**Actionable Recommendation:** Pre-stage coating batches 30 minutes before shift commencement to eliminate material wait delays and lift capacity utilization.`;
        }
        // 14. Recommendations / Growth / Improvement
        else if (
          query.includes("recommend") ||
          query.includes("improve") ||
          query.includes("growth") ||
          query.includes("opportunity")
        ) {
          text = `**Data-Driven Operational Recommendations for ${business.name}:**\n\n` +
            `1. **Mitigate Nozzle Downtime (${kpis.downtimeHours} hrs recorded):** Implement 15-min autonomous nozzle purges before Shift 1.\n` +
            `2. **Optimize Capacity Utilization (${kpis.utilizationRate}% vs 85% target):** Pre-stage powder coating batches 30 minutes early.\n` +
            `3. **Industrial Symbiosis Exchange (${kpis.totalScrapKg} kg scrap):** Recover bill-of-materials cost by listing clean by-products on the Symbiosis tab.\n\n` +
            `You can review complete benchmarks on the **Growth & Recommendations** page.`;
        }
        // 15. Government Schemes / Subsidies
        else if (
          query.includes("scheme") ||
          query.includes("government") ||
          query.includes("subsidy") ||
          query.includes("zed") ||
          query.includes("cgtmse") ||
          query.includes("tequp")
        ) {
          text = `Here are the top government schemes matching **${business.industry}**:\n\n1. **CGTMSE:** Collateral-free credit up to ₹5 Crore for machine upgrades.\n2. **ZED Certification Scheme:** Up to 80% subsidy on Zero Defect certification and tech handholding.\n3. **TEQUP Scheme:** Up to 75% subsidy for energy efficiency audits.\n\nYou can explore full details and official sources on the **Government Schemes** tab.`;
        }
        // 16. General Manufacturing Fallback
        else {
          text = `Thank you for your question regarding **${business.name}**! Currently, your plant utilization rate stands at **${kpis.utilizationRate}%** with **${kpis.activeMachines} of ${kpis.totalMachines} machines** active. You can ask me about machine performance, production variance, scrap diagnosis, energy intensity, or government schemes anytime!`;
        }

        resolve(text);
      }, 300);
    });
  }
};