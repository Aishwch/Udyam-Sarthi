/**
 * UDYAM SARTHI — AI Assistant Operational Diagnosis & Scrap KPI Test Suite
 * Validates unit consistency (kg/unit vs mass %), machine-level calculations,
 * edge cases (zero production, missing values), period comparisons, and regression safety.
 */

import { store } from '../frontend/src/js/store.js';
import { aiService } from '../frontend/src/js/services/aiService.js';
import { dataService } from '../frontend/src/js/services/dataService.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  FAIL: ${testName} ${details ? '- ' + details : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log("====================================================");
  console.log("UDYAM SARTHI: SCRAP KPI & ASSISTANT TEST SUITE");
  console.log("====================================================\n");

  const originalState = JSON.parse(JSON.stringify(store.getState()));

  try {
    // ----------------------------------------------------
    // Scenario 1: Plant-Level & Assistant Scrap Intensity (kg/unit)
    // ----------------------------------------------------
    console.log("1. Scrap Intensity Unit Consistency (kg/unit when material input unavailable)");
    const kpis1 = dataService.getKPIs();
    assert(kpis1.scrapIntensityKgPerUnit === "0.031", "dataService.getKPIs calculates 0.031 kg/unit scrap intensity (18.4 kg / 593 units)");
    assert(kpis1.scrapRateUnit === "kg/unit", "dataService.getKPIs reports scrapRateUnit as 'kg/unit'");
    assert(kpis1.scrapMassPct === null, "dataService.getKPIs sets scrapMassPct to null when material input mass is unrecorded");

    const userPrompt = "My material scrap rate has increased this week. Based on the available operational data, identify the likely cause, provide the relevant KPI values, and suggest three practical actions. If the data is insufficient, tell me what information is missing.";
    const response1 = await aiService.generateResponse(userPrompt);

    assert(response1.includes("**Scrap Diagnosis**"), "Response includes '**Scrap Diagnosis**' header");
    assert(response1.includes("18.4 kg"), "Includes actual scrap quantity (18.4 kg)");
    assert(response1.includes("593 units"), "Includes actual production quantity (593 units)");
    assert(response1.includes("0.031 kg/unit"), "Includes scrap intensity labelled strictly as '0.031 kg/unit'");
    assert(!response1.includes("0.031%"), "Does not label 0.031 as a percentage");
    assert(!response1.includes("3.10%"), "Does not label scrap/output as a 3.10% percentage");
    assert(response1.includes("Total Scrap 18.4 kg / Actual Production Output 593 units"), "States exact calculation basis");
    assert(response1.includes("reported as scrap intensity in kg per produced unit"), "Explains why metric is reported in kg/unit");
    assert(response1.includes("Machine A (Automated Powder Coater)"), "Identifies Machine A as primary contributor");
    assert(response1.includes("13.5 kg") && response1.includes("73.4%"), "Cites Machine A scrap share (13.5 kg / 73.4%)");
    assert(response1.includes("0.047 kg/unit"), "Reports Machine A machine-level scrap intensity in kg/unit");
    assert(response1.includes("0.025 kg/unit"), "Reports Machine B machine-level scrap intensity in kg/unit");
    assert(response1.includes("0.007 kg/unit"), "Reports Machine C machine-level scrap intensity in kg/unit");
    assert(response1.includes("nozzle clog") || response1.includes("Nozzle clog"), "Identifies recorded nozzle clog incident on Machine A");
    assert(response1.includes("circuit breaker") || response1.includes("power"), "Identifies recorded breaker/power incident on Machine A");
    assert(response1.includes("Observed Facts") && response1.includes("Possible Explanations"), "Distinguishes observed facts from possible explanations/hypotheses");
    assert(response1.includes("Three practical actions:"), "Provides practical actions section");
    assert(response1.includes("1.") && response1.includes("2.") && response1.includes("3."), "Provides exactly 3 numbered actions");
    assert(response1.includes("Hypotheses, not confirmed root causes"), "Distinguishes hypotheses from confirmed root causes");
    assert(response1.includes("Missing information and limitations:"), "Discloses missing information and limitations");
    assert(response1.includes("Prior-week baseline logs are not available"), "Refrains from falsely claiming an increase without baseline comparison");

    // ----------------------------------------------------
    // Scenario 2: Machine-Level Calculations via dataService
    // ----------------------------------------------------
    console.log("\n2. Machine-Level Performance & Scrap Intensity Calculations");
    const machinePerf = dataService.getMachinePerformance();
    const machA = machinePerf.find(m => m.id === "m-101");
    const machB = machinePerf.find(m => m.id === "m-102");
    const machC = machinePerf.find(m => m.id === "m-103");

    assert(machA && machA.scrapIntensityKgPerUnit === "0.047", "Machine A scrap intensity is 0.047 kg/unit (13.5 kg / 286 units)");
    assert(machB && machB.scrapIntensityKgPerUnit === "0.025", "Machine B scrap intensity is 0.025 kg/unit (3.9 kg / 159 units)");
    assert(machC && machC.scrapIntensityKgPerUnit === "0.007", "Machine C scrap intensity is 0.007 kg/unit (1.0 kg / 148 units)");
    assert(machA.scrapMetricLabel === "0.047 kg/unit", "Machine A scrapMetricLabel displays '0.047 kg/unit'");

    // ----------------------------------------------------
    // Scenario 3: Conventional Scrap Mass Percentage When Material Input Mass is Available
    // ----------------------------------------------------
    console.log("\n3. Conventional Scrap Mass Percentage (%) when Material Input Mass is Available");
    store.setState({
      operations: [
        { id: "op-mat-1", date: "2026-08-29", machineId: "m-101", machineName: "Machine A", actualOutput: 100, scrapQuantityKg: 5.0, materialInputKg: 100.0, downtimeHours: 0.5, downtimeReason: "None" },
        { id: "op-mat-2", date: "2026-08-29", machineId: "m-102", machineName: "Machine B", actualOutput: 100, scrapQuantityKg: 3.0, materialInputKg: 100.0, downtimeHours: 0.0, downtimeReason: "None" }
      ]
    });
    const kpisWithMat = dataService.getKPIs();
    assert(kpisWithMat.hasMaterialInput === true, "Detects material input mass presence");
    assert(kpisWithMat.scrapMassPct === "4.00", "Calculates conventional scrap mass percentage as 4.00% ((8 kg / 200 kg) * 100)");
    assert(kpisWithMat.scrapRateUnit === "%", "Reports unit as '%' when material input mass is available");

    const responseWithMat = await aiService.generateResponse("What is my scrap rate?");
    assert(responseWithMat.includes("Scrap mass percentage and its calculation basis:"), "Labels metric as conventional scrap mass percentage");
    assert(responseWithMat.includes("4.00%"), "Reports 4.00% mass percentage");
    assert(responseWithMat.includes("Total Scrap 8.0 kg / Total Material Input 200.0 kg"), "Shows mass/mass formula basis");

    // ----------------------------------------------------
    // Scenario 4: Zero Scrap Records in Operations
    // ----------------------------------------------------
    console.log("\n4. Scrap Queries with Zero Scrap Records");
    store.setState({
      operations: originalState.operations.map(op => ({ ...op, scrapQuantityKg: 0 }))
    });
    const responseZeroScrap = await aiService.generateResponse("Why is my scrap rate high?");
    assert(responseZeroScrap.includes("0.0 kg"), "Reports actual scrap quantity as 0.0 kg");
    assert(responseZeroScrap.includes("0.000 kg/unit"), "Calculates scrap intensity as 0.000 kg/unit");
    assert(!responseZeroScrap.includes("0.00%"), "Does not label scrap/units as 0.00%");
    assert(responseZeroScrap.includes("does not show an increase") || responseZeroScrap.includes("Available records show 0.0 kg scrap"), "Refutes claim of increase when scrap is zero");

    // ----------------------------------------------------
    // Scenario 5: Empty Operations Log (No Data at All)
    // ----------------------------------------------------
    console.log("\n5. Scrap Queries with Empty Operational Database");
    store.setState({ operations: [] });
    const responseEmpty = await aiService.generateResponse("What is causing my scrap rate?");
    assert(responseEmpty.includes("No operational records available"), "Detects absence of operational records");
    assert(responseEmpty.includes("Cannot be calculated"), "Refuses to invent scrap rate without data");
    assert(responseEmpty.includes("All operational data is missing"), "States clearly that operational logs are missing");

    // ----------------------------------------------------
    // Scenario 6: Missing Production Quantity (Output = 0, Scrap > 0)
    // ----------------------------------------------------
    console.log("\n6. Missing Production Quantity (Output = 0, Scrap > 0)");
    store.setState({
      operations: [
        { id: "op-zero-out", date: "2026-08-29", machineId: "m-101", machineName: "Machine A", actualOutput: 0, scrapQuantityKg: 10.0, downtimeHours: 1.0, downtimeReason: "Nozzle clog" }
      ]
    });
    const responseZeroOut = await aiService.generateResponse("Analyze scrap on Machine A");
    assert(responseZeroOut.includes("Missing from operational logs (0 units recorded)"), "Notes production output is missing");
    assert(responseZeroOut.includes("Cannot be calculated"), "Does not divide by zero");
    assert(responseZeroOut.includes("Please provide production counts"), "Asks for missing production information");

    // ----------------------------------------------------
    // Scenario 7: Multi-Period Reporting Comparison in kg/unit
    // ----------------------------------------------------
    console.log("\n7. Multi-Period Reporting Comparison in kg/unit (Genuine Increase vs Decrease)");
    // Case 7A: Valid increase from Week 34 to Week 35
    store.setState({
      operations: [
        // Week 34: 100 units, 2 kg scrap = 0.020 kg/unit
        { id: "op-w34", date: "2026-08-18", machineId: "m-101", machineName: "Machine A", actualOutput: 100, scrapQuantityKg: 2.0, downtimeHours: 0.5, downtimeReason: "None" },
        // Week 35: 100 units, 5 kg scrap = 0.050 kg/unit
        { id: "op-w35", date: "2026-08-25", machineId: "m-101", machineName: "Machine A", actualOutput: 100, scrapQuantityKg: 5.0, downtimeHours: 1.0, downtimeReason: "Nozzle clog", notes: "Severe clog" }
      ]
    });
    const response7A = await aiService.generateResponse("Has scrap rate increased this week?");
    assert(response7A.includes("Scrap intensity increased from 0.020 kg/unit"), "Validates scrap intensity increase in kg/unit");
    assert(response7A.includes("to 0.050 kg/unit"), "Accurately calculates current scrap intensity in kg/unit");
    assert(response7A.includes("+0.030 kg/unit"), "Reports change in kg/unit");

    // Case 7B: Valid decrease from Week 34 to Week 35
    store.setState({
      operations: [
        // Week 34: 100 units, 6 kg scrap = 0.060 kg/unit
        { id: "op-w34", date: "2026-08-18", machineId: "m-101", machineName: "Machine A", actualOutput: 100, scrapQuantityKg: 6.0, downtimeHours: 1.0, downtimeReason: "Power" },
        // Week 35: 100 units, 2 kg scrap = 0.020 kg/unit
        { id: "op-w35", date: "2026-08-25", machineId: "m-101", machineName: "Machine A", actualOutput: 100, scrapQuantityKg: 2.0, downtimeHours: 0.2, downtimeReason: "None" }
      ]
    });
    const response7B = await aiService.generateResponse("My material scrap rate has increased this week. What is the cause?");
    assert(response7B.includes("Scrap intensity did not increase"), "Refutes user assertion when data shows scrap intensity decreased");
    assert(response7B.includes("decreased from 0.060 kg/unit"), "Shows historical drop from 0.060 to 0.020 kg/unit");

    // ----------------------------------------------------
    // Scenario 8: Unsupported Root Cause Handling
    // ----------------------------------------------------
    console.log("\n8. Unsupported Root Cause Handling");
    store.setState({
      operations: [
        { id: "op-unsupported", date: "2026-08-29", machineId: "m-101", machineName: "Machine A", actualOutput: 200, scrapQuantityKg: 8.0, downtimeHours: 0.0, downtimeReason: "None", notes: "" }
      ]
    });
    const response8 = await aiService.generateResponse("Why is there scrap on Machine A?");
    assert(response8.includes("No specific stoppage reasons documented in shift logs"), "Discloses that incident reasons are missing rather than fabricating causes");

    // ----------------------------------------------------
    // Scenario 9: Regression Testing for Existing Query Types
    // ----------------------------------------------------
    console.log("\n9. Regression Testing for Existing Query Types");
    store.setState(originalState);

    // 9A: Production variance query
    const resProd = await aiService.generateResponse("Why did my production fall this week?");
    assert(resProd.includes("actual production was") && resProd.includes("variance"), "Production variance handler works");

    // 9B: Machine performance query
    const resMachine = await aiService.generateResponse("Which machine is performing worst?");
    assert(resMachine.includes("Machine A (Automated Powder Coater)") && resMachine.includes("underperforming"), "Machine performance handler works");

    // 9C: Machine downtime query
    const resDowntime = await aiService.generateResponse("What can I do to reduce downtime?");
    assert(resDowntime.includes("downtime") && resDowntime.includes("Preventive Nozzle Cleaning"), "Downtime reduction handler works");

    // 9D: Active alerts query
    const resAlerts = await aiService.generateResponse("Why is Machine A showing an alert?");
    assert(resAlerts.includes("Active Alert Summary"), "Alerts summary handler works");

    // 9E: Data-driven recommendations query
    const resRecs = await aiService.generateResponse("What recommendations do you have to improve?");
    assert(resRecs.includes("Data-Driven Operational Recommendations"), "Recommendations handler works");

    // 9F: Government schemes query
    const resSchemes = await aiService.generateResponse("What government schemes may help my business?");
    assert(resSchemes.includes("CGTMSE") && resSchemes.includes("ZED Certification"), "Government schemes handler works");

    // 9G: Energy intensity query
    const resEnergy = await aiService.generateResponse("What is my energy consumption intensity?");
    assert(resEnergy.includes("specific energy consumption") && resEnergy.includes("kWh/unit"), "Energy intensity handler works");

    // 9H: Plant utilization query
    const resUtil = await aiService.generateResponse("What is my plant utilization rate?");
    assert(resUtil.includes("plant capacity utilization"), "Plant utilization handler works");

    // 9I: General Fallback greeting
    const resFallback = await aiService.generateResponse("Hello companion, good morning!");
    assert(resFallback.includes("Thank you for your question regarding") && resFallback.includes("plant utilization rate"), "Fallback greeting works");

    // ----------------------------------------------------
    // Scenario 10: Specific Intent Routing & Tailored Non-Generic Responses
    // ----------------------------------------------------
    console.log("\n10. Specific Intent Routing & Tailored Operational Answers (No Generic Benchmarking Overlaps)");

    // 10A: "Why is Machine A underperforming?"
    const resUnderperforming = await aiService.generateResponse("Why is Machine A underperforming?");
    assert(resUnderperforming.includes("**Machine Underperformance Diagnosis — Machine A"), "Returns dedicated Machine Underperformance Diagnosis");
    assert(resUnderperforming.includes("Efficiency") && (resUnderperforming.includes("79%") || resUnderperforming.includes("80%")), "Includes Machine A efficiency");
    assert(resUnderperforming.includes("3.3 hours"), "Includes Machine A downtime (3.3 hrs)");
    assert(resUnderperforming.includes("13.5 kg"), "Includes Machine A scrap mass (13.5 kg)");
    assert(resUnderperforming.includes("Recorded Facts:") && resUnderperforming.includes("Possible Causes (Hypotheses, not confirmed root causes):"), "Separates recorded facts from hypotheses");
    assert(resUnderperforming.includes("Nozzle clog") && resUnderperforming.includes("circuit breaker"), "Cites actual recorded incidents and dates");
    assert(resUnderperforming.includes("Recommended Actions:") && resUnderperforming.includes("Data Limitations:"), "Includes evidence-linked actions and limitations");

    // 10B: "Compare Machine A, B and C."
    const resComparison = await aiService.generateResponse("Compare Machine A, B and C.");
    assert(resComparison.includes("**Plant Machinery Performance Comparison**"), "Returns Plant Machinery Performance Comparison");
    assert(resComparison.includes("Machine B (Spray Booth 2)") && resComparison.includes("Machine C (Pre-treatment Oven)"), "Includes Machine B and Machine C in comparison");
    assert(resComparison.includes("Metric-Supported Conclusions:"), "Provides metric-supported conclusions rather than unsupported universal ranking");
    assert(resComparison !== resUnderperforming, "Machine comparison response is distinct from underperformance diagnosis");

    // 10C: "How can I reduce scrap?"
    const resReduceScrap = await aiService.generateResponse("How can I reduce scrap?");
    assert(resReduceScrap.includes("**Scrap Reduction Action Plan**"), "Returns dedicated Scrap Reduction Action Plan");
    assert(resReduceScrap.includes("Three Targeted Actions to Reduce Scrap:"), "Provides 3 targeted actions to reduce scrap");
    assert(resReduceScrap.includes("Machine A") && resReduceScrap.includes("73.4%"), "Identifies scrap concentration on Machine A");
    assert(resReduceScrap !== resUnderperforming && resReduceScrap !== resComparison, "Scrap reduction action plan is distinct from other queries");

    // 10D: "Which machine needs maintenance?"
    const resMaintenance = await aiService.generateResponse("Which machine needs maintenance?");
    assert(resMaintenance.includes("**Machinery Maintenance Priority Assessment**"), "Returns Machinery Maintenance Priority Assessment");
    assert(resMaintenance.includes("Priority 1 — Immediate Service Required: Machine A"), "Identifies Machine A as urgent maintenance priority");
    assert(resMaintenance.includes("Priority 2") && resMaintenance.includes("Priority 3"), "Ranks Machine B and Machine C maintenance statuses");

    // 10E: "What evidence supports Machine A's poor performance?"
    const resEvidence = await aiService.generateResponse("What evidence supports Machine A's poor performance?");
    assert(resEvidence.includes("**Operational Evidence Audit — Machine A"), "Returns Operational Evidence Audit");
    assert(resEvidence.includes("Production Output Deficit:") && resEvidence.includes("Disproportionate Material Scrap Generation:"), "Includes quantitative evidence sections");
    assert(resEvidence.includes("Log op-101") || resEvidence.includes("op-104"), "Cites operational shift log references");

    // 10F: "What data is missing to diagnose Machine A?"
    const resMissing = await aiService.generateResponse("What data is missing to diagnose Machine A?");
    assert(resMissing.includes("**Data Gaps & Missing Information — Machine A Diagnosis**"), "Returns Data Gaps & Missing Information response");
    assert(resMissing.includes("Defect Type Breakdown") && resMissing.includes("High-Frequency Machine Telemetry"), "Discloses defect breakdown and sensor telemetry gaps");
    assert(resMissing.includes("Electrical Diagnostic Waveforms"), "Discloses electrical diagnostic waveform gaps");

    // 10G: Missing incident evidence handling (Prevents unsupported root-cause claims)
    store.setState({
      operations: [
        { id: "op-noinc-1", date: "2026-08-29", machineId: "m-101", machineName: "Machine A", actualOutput: 80, expectedOutput: 120, runtimeHours: 6.0, downtimeHours: 2.0, scrapQuantityKg: 10.0, downtimeReason: "None", notes: "" },
        { id: "op-noinc-2", date: "2026-08-29", machineId: "m-102", machineName: "Machine B", actualOutput: 80, expectedOutput: 80, runtimeHours: 8.0, downtimeHours: 0.0, scrapQuantityKg: 1.0, downtimeReason: "None", notes: "" }
      ]
    });
    const resNoIncident = await aiService.generateResponse("Why is Machine A underperforming?");
    assert(resNoIncident.includes("No specific downtime reasons, mechanical jams, or operator failure logs are recorded in the database"), "Discloses absence of incident records");
    assert(!resNoIncident.includes("nozzle clog") && !resNoIncident.includes("Nozzle clog"), "Does NOT invent nozzle clog when incidents are missing");
    assert(!resNoIncident.includes("circuit breaker") && !resNoIncident.includes("Circuit breaker"), "Does NOT invent breaker trip when incidents are missing");
    assert(resNoIncident.includes("Root causes must not be assumed without evidence"), "Warns against assuming unproven root causes");

    // ----------------------------------------------------
    // Summary
    // ----------------------------------------------------
    console.log("\n====================================================");
    console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
    console.log(`PASSED: ${passedTests}`);
    console.log(`FAILED: ${failedTests}`);
    console.log("====================================================");

    if (failedTests > 0) {
      process.exit(1);
    }
  } finally {
    store.setState(originalState);
  }
}

runTestSuite();
