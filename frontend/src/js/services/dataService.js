/* UDYAM SARTHI Data & Analytics Service Layer */
import { store } from '../store.js';

export const dataService = {
  getKPIs: () => {
    const { operations, machines } = store.getState();
    
    let totalActualOutput = 0;
    let totalExpectedOutput = 0;
    let totalRuntimeHours = 0;
    let totalDowntimeHours = 0;
    let totalEnergyKwh = 0;
    let totalScrapKg = 0;

    let totalMaterialInputKg = 0;
    let hasMaterialInput = false;

    operations.forEach(op => {
      totalActualOutput += Number(op.actualOutput || 0);
      totalExpectedOutput += Number(op.expectedOutput || 0);
      totalRuntimeHours += Number(op.runtimeHours || 0);
      totalDowntimeHours += Number(op.downtimeHours || 0);
      totalEnergyKwh += Number(op.energyConsumedKwh || 0);
      totalScrapKg += Number(op.scrapQuantityKg || 0);
      if (op.materialInputKg !== undefined && op.materialInputKg !== null && !isNaN(Number(op.materialInputKg))) {
        totalMaterialInputKg += Number(op.materialInputKg);
        hasMaterialInput = true;
      }
    });

    const variancePercent = totalExpectedOutput > 0
      ? (((totalActualOutput - totalExpectedOutput) / totalExpectedOutput) * 100).toFixed(1)
      : '0.0';

    const utilizationRate = (totalRuntimeHours + totalDowntimeHours) > 0
      ? ((totalRuntimeHours / (totalRuntimeHours + totalDowntimeHours)) * 100).toFixed(1)
      : '0.0';

    const efficiencyRate = totalExpectedOutput > 0
      ? ((totalActualOutput / totalExpectedOutput) * 100).toFixed(1)
      : '0.0';

    const energyPerUnit = totalActualOutput > 0
      ? (totalEnergyKwh / totalActualOutput).toFixed(2)
      : '0.00';

    // Requirement 2: If total material input mass is available, calculate conventional scrap mass percentage
    const hasValidMaterialInput = hasMaterialInput && totalMaterialInputKg > 0;
    const scrapMassPct = hasValidMaterialInput
      ? ((totalScrapKg / totalMaterialInputKg) * 100).toFixed(2)
      : null;

    // Requirement 3: If unavailable, report scrap intensity in kg per produced unit (kg/unit), NOT as a percentage
    const scrapIntensityKgPerUnit = totalActualOutput > 0
      ? (totalScrapKg / totalActualOutput).toFixed(3)
      : '0.000';

    return {
      hasData: operations.length > 0,
      recordCount: operations.length,
      reportingPeriod: 'Aug 2026 (Operational Shift Logs)',
      actualOutput: totalActualOutput,
      expectedOutput: totalExpectedOutput,
      variancePercent,
      utilizationRate,
      efficiencyRate,
      downtimeHours: totalDowntimeHours.toFixed(1),
      energyPerUnit,
      totalScrapKg: totalScrapKg.toFixed(1),
      totalMaterialInputKg: hasValidMaterialInput ? totalMaterialInputKg.toFixed(1) : null,
      hasMaterialInput: hasValidMaterialInput,
      scrapMassPct,
      scrapIntensityKgPerUnit,
      scrapRateMetric: hasValidMaterialInput ? `${scrapMassPct}%` : `${scrapIntensityKgPerUnit} kg/unit`,
      scrapRateLabel: hasValidMaterialInput ? 'Scrap Mass Percentage' : 'Scrap Intensity',
      scrapRateUnit: hasValidMaterialInput ? '%' : 'kg/unit',
      totalMachines: machines.length,
      activeMachines: machines.filter(m => m.status === 'Active').length
    };
  },

  getMachinePerformance: () => {
    const { machines, operations } = store.getState();
    
    return machines.map(m => {
      const logs = operations.filter(op => op.machineId === m.id);
      let actual = 0;
      let expected = 0;
      let downtime = 0;
      let runtime = 0;
      let scrapTotal = 0;
      let materialInputTotal = 0;
      let hasMatInput = false;

      logs.forEach(l => {
        actual += Number(l.actualOutput || 0);
        expected += Number(l.expectedOutput || 0);
        downtime += Number(l.downtimeHours || 0);
        runtime += Number(l.runtimeHours || 0);
        scrapTotal += Number(l.scrapQuantityKg || 0);
        if (l.materialInputKg !== undefined && l.materialInputKg !== null && !isNaN(Number(l.materialInputKg))) {
          materialInputTotal += Number(l.materialInputKg);
          hasMatInput = true;
        }
      });

      const eff = expected > 0 ? Math.round((actual / expected) * 100) : 100;
      const hasValidMat = hasMatInput && materialInputTotal > 0;
      const scrapMassPct = hasValidMat
        ? ((scrapTotal / materialInputTotal) * 100).toFixed(2)
        : null;
      const scrapIntensity = actual > 0
        ? (scrapTotal / actual).toFixed(3)
        : '0.000';

      return {
        ...m,
        actualOutputTotal: actual,
        expectedOutputTotal: expected,
        totalDowntime: downtime.toFixed(1),
        totalRuntime: runtime.toFixed(1),
        efficiency: eff,
        totalScrapKg: scrapTotal.toFixed(1),
        totalMaterialInputKg: hasValidMat ? materialInputTotal.toFixed(1) : null,
        hasMaterialInput: hasValidMat,
        scrapMassPct,
        scrapIntensityKgPerUnit: scrapIntensity,
        scrapMetricLabel: hasValidMat ? `${scrapMassPct}%` : `${scrapIntensity} kg/unit`
      };
    });
  },

  exportToCSV: (filename, dataArray) => {
    if (!dataArray || !dataArray.length) return;
    const headers = Object.keys(dataArray[0]).join(',');
    const rows = dataArray.map(obj => 
      Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};