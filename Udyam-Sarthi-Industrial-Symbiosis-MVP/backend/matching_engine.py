# matching_engine.py

import math


# ==========================================
# 1. CALCULATE DISTANCE
# ==========================================

def calculate_distance(lat1, lon1, lat2, lon2):

    earth_radius = 6371  # kilometers

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return earth_radius * c


# ==========================================
# 2. MATERIAL COMPATIBILITY
# ==========================================

def material_score(supplier_material, buyer_material):

    supplier_material = supplier_material.lower().strip()
    buyer_material = buyer_material.lower().strip()

    # Exact match
    if supplier_material == buyer_material:
        return 100

    # No match for now
    return 0


# ==========================================
# 3. QUANTITY COMPATIBILITY
# ==========================================

def quantity_score(supplier_quantity, buyer_quantity):

    if supplier_quantity <= 0 or buyer_quantity <= 0:
        return 0

    ratio = min(
        supplier_quantity,
        buyer_quantity
    ) / max(
        supplier_quantity,
        buyer_quantity
    )

    return ratio * 100


# ==========================================
# 4. DISTANCE COMPATIBILITY
# ==========================================

def distance_score(distance):

    if distance <= 10:
        return 100

    elif distance <= 25:
        return 90

    elif distance <= 50:
        return 75

    elif distance <= 100:
        return 50

    else:
        return 20


# ==========================================
# 5. FREQUENCY COMPATIBILITY
# ==========================================

def frequency_score(
    supplier_frequency,
    buyer_frequency
):

    supplier_frequency = supplier_frequency.lower()
    buyer_frequency = buyer_frequency.lower()

    if supplier_frequency == buyer_frequency:
        return 100

    return 50


# ==========================================
# 6. CALCULATE FINAL MATCH
# ==========================================

def calculate_match(supplier, buyer):

    # Material score
    material = material_score(
        supplier["material"],
        buyer["material_needed"]
    )

    # Quantity score
    quantity = quantity_score(
        supplier["quantity"],
        buyer["quantity_needed"]
    )

    # Distance
    distance = calculate_distance(
        supplier["latitude"],
        supplier["longitude"],
        buyer["latitude"],
        buyer["longitude"]
    )

    # Distance score
    distance_points = distance_score(distance)

    # Frequency score
    frequency = frequency_score(
        supplier["frequency"],
        buyer["frequency"]
    )

    # ======================================
    # WEIGHTED FINAL SCORE
    # ======================================

    final_score = (
        material * 0.45
        + quantity * 0.25
        + distance_points * 0.20
        + frequency * 0.10
    )

    return {
        "supplier": supplier["name"],
        "buyer": buyer["name"],
        "material": supplier["material"],

        "compatibility_score": round(
            final_score,
            2
        ),

        "material_score": round(
            material,
            2
        ),

        "quantity_score": round(
            quantity,
            2
        ),

        "distance_score": round(
            distance_points,
            2
        ),

        "frequency_score": round(
            frequency,
            2
        ),

        "distance_km": round(
            distance,
            2
        )
    }


# ==========================================
# 7. FIND ALL POSSIBLE MATCHES
# ==========================================

def find_matches(suppliers, buyers):

    matches = []

    for supplier in suppliers:

        for buyer in buyers:

            result = calculate_match(
                supplier,
                buyer
            )

            # Only keep compatible materials
            if result["material_score"] > 0:

                matches.append(result)

    # Sort highest compatibility first
    matches.sort(
        key=lambda x: x["compatibility_score"],
        reverse=True
    )

    return matches