/* UDYAM SARTHI Digital Business Companion AI Response Service */
import { store } from '../store.js';
import { dataService } from './dataService.js';

export const aiService = {
  generateResponse: async (queryText) => {
    const kpis = dataService.getKPIs();
    const { business, machines, alerts } = store.getState();
    const query = queryText.toLowerCase();

    return new Promise((resolve) => {
      setTimeout(() => {
        let text = "";

        if (query.includes("fall") || query.includes("production") || query.includes("output")) {
          text = `Based on your recent production logs for **${business.name}**, actual production was **${kpis.actualOutput} units** against an expected **${kpis.expectedOutput} units** (${kpis.variancePercent}% variance).\n\n**Primary Reasons Identified:**\n1. **Machine A (Powder Coater)** experienced 1.0 hr of unplanned nozzle clog downtime on Aug 29.\n2. **Machine A** experienced power circuit trips on Aug 28.\n\n**Actionable Recommendation:** Perform daily pre-shift spray nozzle purging and verify power voltage stability to recover ~140 units/week.`;
        } else if (query.includes("worst") || query.includes("machine") || query.includes("performing")) {
          text = `Currently, **Machine A (Automated Powder Coater)** is underperforming compared to Machine B & C:\n\n- **Efficiency:** 80.0%\n- **Unplanned Downtime:** 2.5 hours total over the last 3 recorded days\n- **Scrap Output:** 13.5 Kg total\n\nMachine B (Spray Booth 2) and Machine C (Pre-treatment Oven) are operating above 95% efficiency.`;
        } else if (query.includes("reduce downtime") || query.includes("downtime")) {
          text = `To reduce your plant's **${kpis.downtimeHours} hours** of downtime, Udyam Sarthi recommends:\n\n1. **Preventive Nozzle Cleaning:** Schedule 10-minute nozzle flush every 4 hours on Machine A.\n2. **Operator Refresher:** Standardize manual powder feed pressure adjustments.\n3. **Material Staging:** Pre-stage powder coating batches 30 minutes before shift start to eliminate material shortage waits.`;
        } else if (query.includes("alert") || query.includes("warning")) {
          const activeAlerts = alerts.filter(a => !a.acknowledged);
          if (activeAlerts.length > 0) {
            const topAlert = activeAlerts[0];
            text = `**Active Alert Summary for ${topAlert.machineName}:**\n\n*${topAlert.title}*\n${topAlert.summary}\n\n**Possible Contributing Factors:**\n- ${topAlert.possibleFactors.join("\n- ")}\n\nWould you like to open the **Diagnosis** page for full root cause analysis?`;
          } else {
            text = `There are currently no unacknowledged operational alerts. All 3 machines (Machine A, B, C) are operating within normal variance thresholds.`;
          }
        } else if (query.includes("scheme") || query.includes("government") || query.includes("subsidy")) {
          text = `Here are the top government schemes matching **${business.industry}**:\n\n1. **CGTMSE:** Collateral-free credit up to ₹5 Crore for machine upgrades.\n2. **ZED Certification Scheme:** Up to 80% subsidy on Zero Defect certification and tech handholding.\n3. **TEQUP Scheme:** Up to 75% subsidy for energy efficiency audits.\n\nYou can explore full details and official sources on the **Government Schemes** tab.`;
        } else {
          text = `Thank you for your question regarding **${business.name}**! Currently, your plant utilization rate stands at **${kpis.utilizationRate}%** with **${kpis.activeMachines} of ${kpis.totalMachines} machines** active. You can ask me about machine performance, production variance, energy intensity, or government schemes anytime!`;
        }

        resolve(text);
      }, 600);
    });
  }
};