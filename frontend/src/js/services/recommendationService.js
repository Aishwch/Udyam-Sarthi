/* UDYAM SARTHI Explainable Data-Driven Recommendation Service */
import { dataService } from './dataService.js';

const API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:8000';

export const recommendationService = {
  getRecommendations: async () => {
    const kpis = dataService.getKPIs();

    // Prepare payload from actual dataService metrics
    const payload = {
      actual_output: Number(kpis.actualOutput || 0),
      expected_output: Number(kpis.expectedOutput || 0),
      utilization_rate: Number(kpis.utilizationRate || 0),
      efficiency_rate: Number(kpis.efficiencyRate || 0),
      downtime_hours: Number(kpis.downtimeHours || 0),
      energy_per_unit: Number(kpis.energyPerUnit || 0),
      total_scrap_kg: Number(kpis.totalScrapKg || 0),
      industry: "Manufacturing"
    };

    // Try backend API first
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          return data.recommendations;
        }
      }
    } catch (e) {
      // Gracefully fall back to local rule engine
      console.info("Using client-side rule evaluation for recommendations:", e.message);
    }

    // Deterministic Client-side Fallback Evaluation
    const recs = [];

    // 1. Unplanned Downtime Rule
    if (payload.downtime_hours >= 2.5) {
      recs.push({
        id: 'rec-dt-1',
        title: 'Mitigate Unplanned Machine Stoppages',
        priority: 'High',
        category: 'Downtime Reduction',
        trigger_condition: `Downtime recorded at ${payload.downtime_hours} hrs (Threshold: > 2.5 hrs)`,
        current_value: `${payload.downtime_hours} Hours`,
        benchmark_threshold: '≤ 1.5 Hours / Shift',
        why_it_matters: 'Unplanned downtime bottlenecks production throughput, idles downstream stages, and increases indirect operating costs.',
        suggested_action: 'Schedule 15-minute autonomous maintenance purge at shift handover and verify pneumatic line pressure stability.',
        cta_route: '#/diagnosis'
      });
    }

    // 2. Machine Utilization Rule
    if (payload.utilization_rate < 85.0 && payload.utilization_rate > 0) {
      recs.push({
        id: 'rec-ut-1',
        title: 'Improve Plant Capacity Utilization',
        priority: payload.utilization_rate < 75.0 ? 'High' : 'Medium',
        category: 'Capacity Optimization',
        trigger_condition: `Plant utilization is ${payload.utilization_rate}% (Threshold: < 85.0%)`,
        current_value: `${payload.utilization_rate}%`,
        benchmark_threshold: '≥ 85.0% Plant Utilization',
        why_it_matters: 'Sub-optimal machine runtime inflates fixed asset amortization per unit and ties up factory floor capital.',
        suggested_action: 'Pre-stage raw materials 30 minutes prior to shift commencement and cross-train operators on rapid changeover procedures.',
        cta_route: '#/machines'
      });
    }

    // 3. Specific Energy Consumption Rule
    if (payload.energy_per_unit >= 3.5) {
      recs.push({
        id: 'rec-en-1',
        title: 'Reduce Peak Specific Energy Consumption',
        priority: 'Medium',
        category: 'Energy Efficiency',
        trigger_condition: `Energy intensity reached ${payload.energy_per_unit} kWh/unit (Threshold: ≥ 3.5 kWh/unit)`,
        current_value: `${payload.energy_per_unit} kWh/Unit`,
        benchmark_threshold: '≤ 3.20 kWh / Unit',
        why_it_matters: 'Elevated energy consumption per unit points to process heat loss, motor idling, or uncompensated power factor penalties.',
        suggested_action: 'Inspect pre-treatment thermal chamber insulation gaskets and evaluate TEQUP government scheme energy audit subsidies.',
        cta_route: '#/analytics'
      });
    }

    // 4. Scrap & Material Waste Rule
    if (payload.total_scrap_kg >= 15.0) {
      recs.push({
        id: 'rec-sc-1',
        title: 'Monetize Scrap & Re-evaluate Line Tolerance',
        priority: payload.total_scrap_kg > 25.0 ? 'High' : 'Medium',
        category: 'Material Circularity',
        trigger_condition: `Scrap generation reached ${payload.total_scrap_kg} kg (Threshold: ≥ 15.0 kg)`,
        current_value: `${payload.total_scrap_kg} Kg`,
        benchmark_threshold: '≤ 10.0 Kg / Week',
        why_it_matters: 'Scrap losses directly destroy bill-of-materials margin and create solid industrial disposal liabilities.',
        suggested_action: 'Recalibrate powder coating dispenser nozzle pressure and list off-spec by-product on the Industrial Symbiosis exchange.',
        cta_route: '#/symbiosis'
      });
    }

    // 5. Line Efficiency / Output Variance Rule
    if (payload.efficiency_rate < 90.0 && payload.efficiency_rate > 0) {
      recs.push({
        id: 'rec-ef-1',
        title: 'Recover Line Output Variance',
        priority: 'Medium',
        category: 'Production Recovery',
        trigger_condition: `Line efficiency at ${payload.efficiency_rate}% (Target: ≥ 90.0%)`,
        current_value: `${payload.efficiency_rate}%`,
        benchmark_threshold: '≥ 95.0% Rated Capacity',
        why_it_matters: 'Persistent negative production variance risks customer delivery SLAs and increases overtime shift costs.',
        suggested_action: 'Compare individual machine efficiency metrics on the Operations page to rebalance line batch loading.',
        cta_route: '#/operations'
      });
    }

    if (recs.length === 0) {
      recs.push({
        id: 'rec-opt-1',
        title: 'Plant Operating Within Optimal Parameters',
        priority: 'Low',
        category: 'Continuous Improvement',
        trigger_condition: 'All primary operational KPIs meet or exceed target benchmarks',
        current_value: `${payload.efficiency_rate}% Efficiency | ${payload.utilization_rate}% Utilization`,
        benchmark_threshold: 'All Metrics Within Normal Bounds',
        why_it_matters: 'Stable operations provide an ideal window for planned preventive maintenance and process automation upgrades.',
        suggested_action: 'Explore government ZED certification subsidies or explore expanding secondary material symbiosis partnerships.',
        cta_route: '#/schemes'
      });
    }

    return recs;
  }
};
