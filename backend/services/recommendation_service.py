from schemas.recommendation import RecommendationInput, RecommendationItem


def generate_data_driven_recommendations(data: RecommendationInput) -> list[dict]:
    recs = []

    # 1. Downtime Rule
    if data.downtime_hours >= 2.5:
        recs.append({
            "id": "rec-dt-1",
            "title": "Mitigate Unplanned Machine Stoppages",
            "priority": "High",
            "category": "Downtime Reduction",
            "trigger_condition": f"Downtime recorded at {data.downtime_hours} hrs (Threshold: > 2.5 hrs)",
            "current_value": f"{data.downtime_hours} Hours",
            "benchmark_threshold": "≤ 1.5 Hours / Shift",
            "why_it_matters": "Unplanned downtime reduces plant availability, delays downstream assembly, and increases unit overhead costs.",
            "suggested_action": "Schedule 15-minute autonomous maintenance purge at shift handover and verify pneumatic line pressure stability.",
            "cta_route": "#/diagnosis"
        })

    # 2. Utilization Rule
    if data.utilization_rate < 85.0:
        recs.append({
            "id": "rec-ut-1",
            "title": "Improve Plant Capacity Utilization",
            "priority": "High" if data.utilization_rate < 75.0 else "Medium",
            "category": "Capacity Optimization",
            "trigger_condition": f"Plant utilization is {data.utilization_rate}% (Threshold: < 85.0%)",
            "current_value": f"{data.utilization_rate}%",
            "benchmark_threshold": "≥ 85.0% Plant Utilization",
            "why_it_matters": "Sub-optimal machine runtime inflates fixed asset amortization per unit and ties up factory working capital.",
            "suggested_action": "Pre-stage raw materials 30 minutes prior to shift commencement and cross-train operators on rapid changeover procedures.",
            "cta_route": "#/machines"
        })

    # 3. Energy Intensity Rule
    if data.energy_per_unit >= 3.5:
        recs.append({
            "id": "rec-en-1",
            "title": "Reduce Peak Specific Energy Consumption",
            "priority": "Medium",
            "category": "Energy Efficiency",
            "trigger_condition": f"Energy intensity reached {data.energy_per_unit} kWh/unit (Threshold: ≥ 3.5 kWh/unit)",
            "current_value": f"{data.energy_per_unit} kWh/Unit",
            "benchmark_threshold": "≤ 3.20 kWh / Unit",
            "why_it_matters": "Elevated energy consumption per unit points to process heat loss, motor idling, or uncompensated power factor penalties.",
            "suggested_action": "Inspect pre-treatment thermal chamber insulation gaskets and evaluate TEQUP government scheme energy audit subsidies.",
            "cta_route": "#/analytics"
        })

    # 4. Scrap & Material Waste Rule
    if data.total_scrap_kg >= 15.0:
        recs.append({
            "id": "rec-sc-1",
            "title": "Monetize Scrap & Re-evaluate Line Tolerance",
            "priority": "High" if data.total_scrap_kg > 25.0 else "Medium",
            "category": "Material Circularity",
            "trigger_condition": f"Scrap generation reached {data.total_scrap_kg} kg (Threshold: ≥ 15.0 kg)",
            "current_value": f"{data.total_scrap_kg} Kg",
            "benchmark_threshold": "≤ 10.0 Kg / Week",
            "why_it_matters": "Scrap losses directly destroy bill-of-materials margin and create solid industrial disposal liabilities.",
            "suggested_action": "Recalibrate powder coating dispenser nozzle pressure and list off-spec by-product on the Industrial Symbiosis exchange.",
            "cta_route": "#/symbiosis"
        })

    # 5. Output Variance / Efficiency Rule
    if data.efficiency_rate < 90.0:
        recs.append({
            "id": "rec-ef-1",
            "title": "Recover Line Output Variance",
            "priority": "Medium",
            "category": "Production Recovery",
            "trigger_condition": f"Line efficiency at {data.efficiency_rate}% (Target: ≥ 90.0%)",
            "current_value": f"{data.efficiency_rate}%",
            "benchmark_threshold": "≥ 95.0% Rated Capacity",
            "why_it_matters": "Persistent negative production variance risks customer delivery SLAs and increases overtime shift costs.",
            "suggested_action": "Compare individual machine efficiency metrics on the Operations page to rebalance line batch loading.",
            "cta_route": "#/operations"
        })

    # If plant is operating within all benchmarks, provide positive optimization guidance
    if not recs:
        recs.append({
            "id": "rec-opt-1",
            "title": "Plant Operating Within Optimal Parameters",
            "priority": "Low",
            "category": "Continuous Improvement",
            "trigger_condition": "All primary operational KPIs meet or exceed target benchmarks",
            "current_value": f"{data.efficiency_rate}% Efficiency | {data.utilization_rate}% Utilization",
            "benchmark_threshold": "All Metrics Within Normal Bounds",
            "why_it_matters": "Stable operations provide an ideal window for planned preventive maintenance and process automation upgrades.",
            "suggested_action": "Explore government ZED certification subsidies or explore expanding secondary material symbiosis partnerships.",
            "cta_route": "#/schemes"
        })

    return recs
