import math
import re
from functools import lru_cache

from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim


# ==================================================
# AI SEMANTIC MODEL
# ==================================================

print("Loading AI semantic model...")

AI_MODEL = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

print("AI semantic model loaded successfully.")


# ==================================================
# MATERIAL NORMALIZATION
# ==================================================

MATERIAL_ALIASES = {

    "fly ash": [
        "fly ash",
        "coal ash",
        "coal fly ash",
        "coal combustion ash",
        "combustion ash",
        "thermal ash",
        "power plant ash",
        "power station ash",
    ],

    "steel scrap": [
        "steel scrap",
        "steel waste",
        "scrap steel",
        "iron steel scrap",
        "steel metal waste",
        "iron scrap",
        "metal scrap",
    ],

    "glass scrap": [
        "glass scrap",
        "glass waste",
        "waste glass",
        "broken glass",
        "glass pieces",
        "glass cullet",
        "cullet",
    ],

    "gypsum": [
        "gypsum",
        "waste gypsum",
        "synthetic gypsum",
        "industrial gypsum",
    ],

    "textile waste": [
        "textile waste",
        "textile scrap",
        "fabric waste",
        "cloth waste",
        "fabric scrap",
        "cloth scrap",
    ],

    "plastic scrap": [
        "plastic scrap",
        "plastic waste",
        "waste plastic",
        "plastic material",
        "plastic scrap material",
    ],

    "paper waste": [
        "paper waste",
        "paper scrap",
        "waste paper",
        "paper recycling material",
        "used paper",
        "paper residue",
    ],

    "wood waste": [
        "wood waste",
        "wood scrap",
        "waste wood",
        "wood chips",
        "sawdust",
        "timber waste",
    ],
}


def clean_text(text):
    """
    Converts text into a simple comparable format.
    """

    if text is None:
        return ""

    text = str(text).lower().strip()

    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


def normalize_material(material):
    """
    Converts different names of the same material
    into one standard material name.
    """

    material = clean_text(material)

    if not material:
        return ""

    for standard_name, aliases in MATERIAL_ALIASES.items():

        for alias in aliases:

            alias = clean_text(alias)

            if material == alias:
                return standard_name

            if alias in material:
                return standard_name

    return material


# ==================================================
# TRADITIONAL MATERIAL SCORE
# ==================================================

def traditional_material_score(
    supplier_material,
    buyer_material
):
    """
    Rule / alias based material compatibility.

    Maximum = 45 points.
    """

    supplier = normalize_material(
        supplier_material
    )

    buyer = normalize_material(
        buyer_material
    )

    if not supplier or not buyer:
        return 0

    # Exact normalized match
    if supplier == buyer:
        return 45

    # Word overlap
    supplier_words = set(
        supplier.split()
    )

    buyer_words = set(
        buyer.split()
    )

    if not supplier_words or not buyer_words:
        return 0

    common_words = (
        supplier_words.intersection(
            buyer_words
        )
    )

    if common_words:

        overlap = (
            len(common_words)
            /
            max(
                len(supplier_words),
                len(buyer_words)
            )
        )

        return round(
            45 * overlap,
            2
        )

    return 0


# ==================================================
# RAW AI SEMANTIC SIMILARITY
# ==================================================

@lru_cache(maxsize=5000)
def _semantic_similarity_cached(
    text1,
    text2
):
    """
    Returns cosine similarity between two
    cleaned text strings.

    Cached so repeated comparisons do not
    unnecessarily recompute embeddings.
    """

    if not text1 or not text2:
        return 0.0

    try:

        embeddings = AI_MODEL.encode(
            [
                text1,
                text2
            ],
            convert_to_tensor=True
        )

        similarity = cos_sim(
            embeddings[0],
            embeddings[1]
        )

        similarity_value = float(
            similarity.item()
        )

        return max(
            -1.0,
            min(
                1.0,
                similarity_value
            )
        )

    except Exception as error:

        print(
            "AI semantic similarity error:",
            error
        )

        return 0.0


def semantic_similarity(
    text1,
    text2
):
    """
    Clean text and calculate semantic similarity.
    """

    cleaned_text1 = clean_text(text1)
    cleaned_text2 = clean_text(text2)

    if not cleaned_text1 or not cleaned_text2:
        return 0.0

    return _semantic_similarity_cached(
        cleaned_text1,
        cleaned_text2
    )


# ==================================================
# CALIBRATED AI SCORE
# ==================================================

def similarity_to_score(
    similarity,
    maximum_score
):
    """
    Converts cosine similarity into a practical
    score.

    This avoids giving unrelated text a large
    automatic baseline score.

    Heuristic range:
        <= 0.25  -> 0
        0.80+    -> maximum
    """

    low_similarity = 0.25
    high_similarity = 0.80

    if similarity <= low_similarity:
        return 0

    if similarity >= high_similarity:
        return maximum_score

    normalized = (
        similarity - low_similarity
    ) / (
        high_similarity - low_similarity
    )

    normalized = max(
        0.0,
        min(
            1.0,
            normalized
        )
    )

    return round(
        normalized * maximum_score,
        2
    )


# ==================================================
# AI MATERIAL SEMANTIC SCORE
# ==================================================

def ai_material_similarity(
    supplier_material,
    buyer_material
):
    """
    AI semantic material compatibility.

    Returns a score from 0 to 45.
    """

    supplier_text = clean_text(
        supplier_material
    )

    buyer_text = clean_text(
        buyer_material
    )

    if not supplier_text or not buyer_text:
        return 0

    similarity = semantic_similarity(
        supplier_text,
        buyer_text
    )

    return similarity_to_score(
        similarity,
        45
    )


# ==================================================
# SPECIFICATION SEMANTIC SCORE
# ==================================================

def specification_similarity(
    supplier_specification,
    buyer_specification
):
    """
    Compares material specifications.

    Returns:
        score from 0 to 5
        similarity from 0 to 1
    """

    supplier_text = clean_text(
        supplier_specification
    )

    buyer_text = clean_text(
        buyer_specification
    )

    if not supplier_text or not buyer_text:

        return {
            "score": 0,
            "similarity": 0.0,
            "available": False
        }

    similarity = semantic_similarity(
        supplier_text,
        buyer_text
    )

    score = similarity_to_score(
        similarity,
        5
    )

    return {
        "score": score,
        "similarity": round(
            similarity,
            4
        ),
        "available": True
    }


# ==================================================
# QUALITY SEMANTIC SCORE
# ==================================================

def quality_similarity(
    supplier_quality,
    buyer_quality
):
    """
    Compares supplier quality notes with
    buyer quality requirements.

    Informational maximum = 5.

    This value is incorporated into the
    material compatibility calculation.
    """

    supplier_text = clean_text(
        supplier_quality
    )

    buyer_text = clean_text(
        buyer_quality
    )

    if not supplier_text or not buyer_text:

        return {
            "score": 0,
            "similarity": 0.0,
            "available": False
        }

    similarity = semantic_similarity(
        supplier_text,
        buyer_text
    )

    score = similarity_to_score(
        similarity,
        5
    )

    return {
        "score": score,
        "similarity": round(
            similarity,
            4
        ),
        "available": True
    }


# ==================================================
# FINAL MATERIAL COMPATIBILITY
# ==================================================

def calculate_material_compatibility(
    supplier_material,
    buyer_material,
    supplier_specification=None,
    buyer_specification=None,
    supplier_quality=None,
    buyer_quality=None
):
    """
    Calculates the complete material compatibility.

    Maximum = 45 points.

    Base material compatibility:
        Rule-based = 60%
        AI semantic = 40%

    When both specifications are available:
        Specification contributes to the final
        material compatibility.

    When both quality descriptions are available:
        Quality contributes to the final
        material compatibility.

    Important:
        Specification and quality do NOT create
        extra points. Everything remains inside
        the existing 45-point material component.
    """

    traditional_score = (
        traditional_material_score(
            supplier_material,
            buyer_material
        )
    )

    ai_score = (
        ai_material_similarity(
            supplier_material,
            buyer_material
        )
    )

    # Convert material scores to 0-1
    traditional_normalized = (
        traditional_score / 45
    )

    ai_normalized = (
        ai_score / 45
    )

    # Existing hybrid material score
    base_material_normalized = (
        traditional_normalized * 0.60
        +
        ai_normalized * 0.40
    )

    specification_result = (
        specification_similarity(
            supplier_specification,
            buyer_specification
        )
    )

    quality_result = (
        quality_similarity(
            supplier_quality,
            buyer_quality
        )
    )

    # --------------------------------------------------
    # WEIGHT MANAGEMENT
    # --------------------------------------------------

    components = [
        (
            base_material_normalized,
            0.70
        )
    ]

    if specification_result["available"]:

        components.append(
            (
                specification_result["score"] / 5,
                0.20
            )
        )

    if quality_result["available"]:

        components.append(
            (
                quality_result["score"] / 5,
                0.10
            )
        )

    # --------------------------------------------------
    # REDISTRIBUTE MISSING WEIGHT
    # --------------------------------------------------

    total_weight = sum(
        weight
        for _, weight in components
    )

    if total_weight <= 0:

        final_normalized = 0

    else:

        final_normalized = sum(
            value * weight
            for value, weight in components
        ) / total_weight

    # --------------------------------------------------
    # EXACT KNOWN MATERIAL
    # --------------------------------------------------

    # A known exact material remains strong,
    # but specification/quality can still refine it.
    if traditional_score == 45:

        if (
            specification_result["available"]
            or
            quality_result["available"]
        ):

            final_score = (
                final_normalized * 45
            )

        else:

            final_score = 45

    else:

        final_score = (
            final_normalized * 45
        )

    final_score = round(
        max(
            0,
            min(
                45,
                final_score
            )
        ),
        2
    )

    return {
        "traditional_score":
            traditional_score,

        "ai_score":
            ai_score,

        "specification_score":
            specification_result["score"],

        "specification_similarity":
            specification_result["similarity"],

        "specification_available":
            specification_result["available"],

        "quality_score":
            quality_result["score"],

        "quality_similarity":
            quality_result["similarity"],

        "quality_available":
            quality_result["available"],

        "final_score":
            final_score
    }


# ==================================================
# BACKWARD-COMPATIBLE MATERIAL SCORE
# ==================================================

def material_score(
    supplier_material,
    buyer_material
):
    """
    Backward-compatible material scoring function.

    Maximum = 45.
    """

    result = calculate_material_compatibility(
        supplier_material,
        buyer_material
    )

    return result["final_score"]


# ==================================================
# UNIT CONVERSIONS
# ==================================================

UNIT_CONVERSIONS = {

    "kg": 1,
    "kgs": 1,
    "kilogram": 1,
    "kilograms": 1,

    "ton": 1000,
    "tons": 1000,
    "tonne": 1000,
    "tonnes": 1000,

    "g": 0.001,
    "gram": 0.001,
    "grams": 0.001,

}


def extract_unit(unit_text):
    """
    Extracts the mass unit from values such as:

        kg/month
        kg/day
        ton/month
        tonne/month
    """

    unit_text = clean_text(
        unit_text
    )

    for unit in UNIT_CONVERSIONS:

        if unit in unit_text:
            return unit

    return "kg"


def convert_to_kg(
    quantity,
    unit
):
    """
    Converts a quantity into kilograms.
    """

    unit_name = extract_unit(
        unit
    )

    conversion = UNIT_CONVERSIONS.get(
        unit_name,
        1
    )

    return quantity * conversion


# ==================================================
# QUANTITY SCORE
# ==================================================

def quantity_score(
    supplier_quantity,
    buyer_quantity,
    supplier_unit="kg",
    buyer_unit="kg"
):
    """
    Maximum = 25 points.
    """

    try:

        supplier_quantity = float(
            supplier_quantity
        )

        buyer_quantity = float(
            buyer_quantity
        )

    except (
        TypeError,
        ValueError
    ):

        return 0

    if (
        supplier_quantity <= 0
        or buyer_quantity <= 0
    ):

        return 0

    supplier_kg = convert_to_kg(
        supplier_quantity,
        supplier_unit
    )

    buyer_kg = convert_to_kg(
        buyer_quantity,
        buyer_unit
    )

    if buyer_kg <= 0:
        return 0

    ratio = (
        supplier_kg
        /
        buyer_kg
    )

    if ratio >= 1:

        return 25

    return round(
        ratio * 25,
        2
    )


# ==================================================
# DISTANCE CALCULATION
# ==================================================

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):
    """
    Calculates geographic distance using
    the Haversine formula.

    Result = kilometres.
    """

    try:

        lat1 = float(lat1)
        lon1 = float(lon1)
        lat2 = float(lat2)
        lon2 = float(lon2)

    except (
        TypeError,
        ValueError
    ):

        return 999999

    R = 6371

    lat1 = math.radians(
        lat1
    )

    lat2 = math.radians(
        lat2
    )

    delta_lat = math.radians(
        lat2 - lat1
    )

    delta_lon = math.radians(
        lon2 - lon1
    )

    a = (
        math.sin(
            delta_lat / 2
        ) ** 2

        +

        math.cos(lat1)
        *
        math.cos(lat2)
        *
        math.sin(
            delta_lon / 2
        ) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return R * c


# ==================================================
# DISTANCE SCORE
# ==================================================

def distance_score(distance):
    """
    Maximum = 20 points.
    """

    if distance <= 5:
        return 20

    elif distance <= 10:
        return 18

    elif distance <= 25:
        return 15

    elif distance <= 50:
        return 10

    elif distance <= 100:
        return 5

    else:
        return 0


# ==================================================
# FREQUENCY SCORE
# ==================================================

def frequency_score(
    supplier_frequency,
    buyer_frequency
):
    """
    Maximum = 10 points.
    """

    supplier_frequency = clean_text(
        supplier_frequency
    )

    buyer_frequency = clean_text(
        buyer_frequency
    )

    if (
        supplier_frequency
        ==
        buyer_frequency
    ):

        return 10

    return 5


# ==================================================
# INDUSTRY RELATIONSHIPS
# ==================================================

INDUSTRY_RELATIONSHIPS = {

    "fly ash": [
        "cement",
        "construction",
        "concrete",
        "building",
        "infrastructure",
    ],

    "steel scrap": [
        "metal",
        "steel",
        "recycling",
        "manufacturing",
        "foundry",
        "fabrication",
    ],

    "glass scrap": [
        "glass",
        "recycling",
        "manufacturing",
        "construction",
    ],

    "gypsum": [
        "cement",
        "construction",
        "building",
        "plaster",
        "drywall",
    ],

    "textile waste": [
        "textile",
        "recycling",
        "fabric",
        "manufacturing",
        "garment",
    ],

    "plastic scrap": [
        "plastic",
        "recycling",
        "packaging",
        "manufacturing",
        "polymer",
    ],

    "paper waste": [
        "paper",
        "recycling",
        "packaging",
        "printing",
        "pulp",
    ],

    "wood waste": [
        "wood",
        "furniture",
        "recycling",
        "biomass",
        "timber",
    ],
}


# ==================================================
# INDUSTRY SCORE
# ==================================================

def industry_score(
    material,
    buyer_industry
):
    """
    Maximum = 5 points.
    """

    material = normalize_material(
        material
    )

    buyer_industry = clean_text(
        buyer_industry
    )

    relevant_industries = (
        INDUSTRY_RELATIONSHIPS.get(
            material,
            []
        )
    )

    for industry in relevant_industries:

        if industry in buyer_industry:
            return 5

    return 0


# ==================================================
# COMPLETE MATCH CALCULATION
# ==================================================

def calculate_match(
    supplier,
    buyer
):

    # --------------------------------------------------
    # MATERIAL + SPECIFICATION + QUALITY
    # --------------------------------------------------

    material_result = (
        calculate_material_compatibility(

            supplier_material=
                supplier.material,

            buyer_material=
                buyer.material_needed,

            supplier_specification=
                getattr(
                    supplier,
                    "material_specification",
                    None
                ),

            buyer_specification=
                getattr(
                    buyer,
                    "material_specification",
                    None
                ),

            supplier_quality=
                getattr(
                    supplier,
                    "quality_notes",
                    None
                ),

            buyer_quality=
                getattr(
                    buyer,
                    "quality_notes",
                    None
                )

        )
    )

    traditional_material_points = (
        material_result[
            "traditional_score"
        ]
    )

    ai_material_points = (
        material_result[
            "ai_score"
        ]
    )

    material_points = (
        material_result[
            "final_score"
        ]
    )

    # --------------------------------------------------
    # QUANTITY
    # --------------------------------------------------

    quantity_points = quantity_score(
        supplier.quantity,
        buyer.quantity_needed,
        supplier.unit,
        buyer.unit
    )

    # --------------------------------------------------
    # DISTANCE
    # --------------------------------------------------

    distance = calculate_distance(
        supplier.latitude,
        supplier.longitude,
        buyer.latitude,
        buyer.longitude
    )

    distance_points = distance_score(
        distance
    )

    # --------------------------------------------------
    # FREQUENCY
    # --------------------------------------------------

    frequency_points = frequency_score(
        supplier.frequency,
        buyer.frequency
    )

    # --------------------------------------------------
    # INDUSTRY
    # --------------------------------------------------

    industry_points = industry_score(
        supplier.material,
        buyer.industry
    )

    # --------------------------------------------------
    # TOTAL
    # --------------------------------------------------

    total_score = (
        material_points
        +
        quantity_points
        +
        distance_points
        +
        frequency_points
        +
        industry_points
    )

    # --------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------

    return {

        # ==============================================
        # SUPPLIER
        # ==============================================

        "supplier_id":
            supplier.id,

        "supplier_name":
            supplier.name,

        "supplier_location":
            supplier.location,

        "supplier_industry":
            supplier.industry,

        "supplier_quantity":
            supplier.quantity,

        "supplier_unit":
            supplier.unit,

        "supplier_frequency":
            supplier.frequency,

        # ==============================================
        # BUYER
        # ==============================================

        "buyer_id":
            buyer.id,

        "buyer_name":
            buyer.name,

        "buyer_location":
            buyer.location,

        "buyer_industry":
            buyer.industry,

        "buyer_quantity_needed":
            buyer.quantity_needed,

        "buyer_unit":
            buyer.unit,

        "buyer_frequency":
            buyer.frequency,

        # ==============================================
        # MATERIAL
        # ==============================================

        "material":
            supplier.material,

        "buyer_material_needed":
            buyer.material_needed,

        "normalized_material":
            normalize_material(
                supplier.material
            ),

        # ==============================================
        # SPECIFICATION
        # ==============================================

        "supplier_material_specification":
            getattr(
                supplier,
                "material_specification",
                None
            ),

        "buyer_material_specification":
            getattr(
                buyer,
                "material_specification",
                None
            ),

        "specification_score":
            material_result[
                "specification_score"
            ],

        "specification_max_score":
            5,

        "specification_similarity":
            material_result[
                "specification_similarity"
            ],

        # ==============================================
        # QUALITY
        # ==============================================

        "supplier_quality_notes":
            getattr(
                supplier,
                "quality_notes",
                None
            ),

        "buyer_quality_notes":
            getattr(
                buyer,
                "quality_notes",
                None
            ),

        "quality_score":
            material_result[
                "quality_score"
            ],

        "quality_max_score":
            5,

        "quality_similarity":
            material_result[
                "quality_similarity"
            ],

        # ==============================================
        # DISTANCE
        # ==============================================

        "distance_km":
            round(
                distance,
                2
            ),

        # ==============================================
        # MATERIAL SCORE DETAILS
        # ==============================================

        "traditional_material_score":
            traditional_material_points,

        "ai_material_score":
            ai_material_points,

        "material_score":
            material_points,

        # ==============================================
        # OTHER SCORES
        # ==============================================

        "quantity_score":
            quantity_points,

        "distance_score":
            distance_points,

        "frequency_score":
            frequency_points,

        "industry_score":
            industry_points,

        # ==============================================
        # FINAL SCORE
        # ==============================================

        "match_score":
            round(
                total_score,
                2
            )
    }