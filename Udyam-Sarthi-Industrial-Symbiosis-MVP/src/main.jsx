import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import { createRoot } from 'react-dom/client';

import {
  Factory,
  Recycle,
  ArrowRight,
  MapPin,
  Package,
  Search,
  Leaf
} from 'lucide-react';

import './styles.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  // ==================================================
  // NAVIGATION
  // ==================================================

  const [tab, setTab] = useState('matches');
  const [query, setQuery] = useState('');

  // ==================================================
  // MATCH FILTERS
  // ==================================================

  const [materialFilter, setMaterialFilter] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [maxDistance, setMaxDistance] = useState(9999);

  // ==================================================
  // BACKEND DATA
  // ==================================================

  const [suppliers, setSuppliers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==================================================
  // REGISTRATION
  // ==================================================

  const [registrationType, setRegistrationType] =
    useState('supplier');

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',

    latitude: '',
    longitude: '',

    material: '',

    materialSpecification: '',
    qualityNotes: '',

    quantity: '',
    unit: 'kg/month',
    frequency: 'Monthly'
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');

  // ==================================================
  // SMART LOCATION
  // ==================================================

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  // ==================================================
  // LOAD DATA
  // ==================================================

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [
        suppliersResponse,
        buyersResponse,
        matchesResponse
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/suppliers`),
        fetch(`${API_BASE_URL}/api/buyers`),
        fetch(`${API_BASE_URL}/api/matches`)
      ]);

      if (
        !suppliersResponse.ok ||
        !buyersResponse.ok ||
        !matchesResponse.ok
      ) {
        throw new Error(
          'Failed to load data from backend.'
        );
      }

      const suppliersData =
        await suppliersResponse.json();

      const buyersData =
        await buyersResponse.json();

      const matchesData =
        await matchesResponse.json();

      setSuppliers(
        Array.isArray(suppliersData)
          ? suppliersData
          : []
      );

      setBuyers(
        Array.isArray(buyersData)
          ? buyersData
          : []
      );

      setMatches(
        Array.isArray(matchesData?.matches)
          ? matchesData.matches
          : []
      );

      console.log(
        'SUPPLIERS:',
        suppliersData
      );

      console.log(
        'BUYERS:',
        buyersData
      );

      console.log(
        'MATCHES:',
        matchesData?.matches
      );
    } catch (err) {
      console.error(
        'Load data error:',
        err
      );

      setError(
        'Could not connect to the backend. Make sure FastAPI is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadData();
  }, []);

  // ==================================================
  // FILTERED MATCHES
  // ==================================================

  const filteredMatches = useMemo(() => {
    const searchText = query
      .toLowerCase()
      .trim();

    return matches.filter((match) => {
      const searchableText = [
        match.supplier_name,
        match.buyer_name,
        match.material,
        match.buyer_material_needed,
        match.normalized_material,
        match.supplier_industry,
        match.buyer_industry,
        match.supplier_location,
        match.buyer_location,
        match.supplier_material_specification,
        match.buyer_material_specification,
        match.supplier_quality_notes,
        match.buyer_quality_notes
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !searchText ||
        searchableText.includes(searchText);

      const matchesMaterial =
        materialFilter === 'all' ||
        match.normalized_material ===
          materialFilter;

      const matchesScore =
        Number(match.match_score || 0) >=
        Number(minScore);

      const matchesDistance =
        Number(match.distance_km || 0) <=
        Number(maxDistance);

      return (
        matchesSearch &&
        matchesMaterial &&
        matchesScore &&
        matchesDistance
      );
    });
  }, [
    matches,
    query,
    materialFilter,
    minScore,
    maxDistance
  ]);

  // ==================================================
  // AVAILABLE MATERIALS
  // ==================================================

  const availableMaterials = useMemo(() => {
    const materials = matches
      .map(
        (match) =>
          match.normalized_material
      )
      .filter(Boolean);

    return [
      ...new Set(materials)
    ].sort();
  }, [matches]);

  // ==================================================
  // DASHBOARD CALCULATIONS
  // ==================================================

  const highCompatibilityMatches =
    matches.filter(
      (match) =>
        Number(match.match_score || 0) >= 85
    );

  const goodCompatibilityMatches =
    matches.filter(
      (match) =>
        Number(match.match_score || 0) >= 65 &&
        Number(match.match_score || 0) < 85
    );

  const potentialMatches = Math.max(
    0,
    matches.length -
      highCompatibilityMatches.length -
      goodCompatibilityMatches.length
  );

  // ==================================================
  // FORM INPUT
  // ==================================================

  function handleInputChange(event) {
    const {
      name,
      value
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // ==================================================
  // RESET FORM
  // ==================================================

  function resetForm() {
    setFormData({
      name: '',
      industry: '',
      location: '',

      latitude: '',
      longitude: '',

      material: '',

      materialSpecification: '',
      qualityNotes: '',

      quantity: '',
      unit: 'kg/month',
      frequency: 'Monthly'
    });
  }

  // ==================================================
  // SMART LOCATION SEARCH
  // ==================================================

  async function findLocation() {
    const location =
      formData.location.trim();

    if (!location) {
      setLocationMessage(
        'Please enter a location first.'
      );
      return;
    }

    try {
      setLocationLoading(true);
      setLocationMessage('');

      const url =
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}&limit=1`;

      const response =
        await fetch(url);

      if (!response.ok) {
        throw new Error(
          'Location service is currently unavailable.'
        );
      }

      const results =
        await response.json();

      if (
        !Array.isArray(results) ||
        results.length === 0
      ) {
        throw new Error(
          'Location not found. Try entering a city, district or industrial area.'
        );
      }

      const result = results[0];

      setFormData((previous) => ({
        ...previous,
        latitude: result.lat,
        longitude: result.lon
      }));

      setLocationMessage(
        `✓ Location found: ${result.display_name}`
      );
    } catch (err) {
      console.error(
        'Location error:',
        err
      );

      setLocationMessage(
        err.message ||
        'Could not find this location.'
      );

      setFormData((previous) => ({
        ...previous,
        latitude: '',
        longitude: ''
      }));
    } finally {
      setLocationLoading(false);
    }
  }

  // ==================================================
  // CHANGE REGISTRATION TYPE
  // ==================================================

  function changeRegistrationType(type) {
    setRegistrationType(type);

    setFormMessage('');
    setFormError('');
    setLocationMessage('');

    resetForm();
  }

  // ==================================================
  // REGISTER SUPPLIER / BUYER
  // ==================================================

  async function handleRegistration(event) {
    event.preventDefault();

    setFormLoading(true);
    setFormMessage('');
    setFormError('');

    try {
      // ------------------------------------------------
      // BASIC VALIDATION
      // ------------------------------------------------

      if (!formData.name.trim()) {
        throw new Error(
          'Please enter the company name.'
        );
      }

      if (!formData.industry.trim()) {
        throw new Error(
          'Please enter the industry.'
        );
      }

      if (!formData.location.trim()) {
        throw new Error(
          'Please enter the location.'
        );
      }

      if (!formData.material.trim()) {
        throw new Error(
          registrationType === 'supplier'
            ? 'Please enter the material generated.'
            : 'Please enter the material needed.'
        );
      }

      if (
        !formData.quantity ||
        Number(formData.quantity) <= 0
      ) {
        throw new Error(
          'Quantity must be greater than 0.'
        );
      }

      // ------------------------------------------------
      // LOCATION VALIDATION
      // ------------------------------------------------

      if (
        formData.latitude === '' ||
        formData.longitude === ''
      ) {
        throw new Error(
          'Please find your location before registering.'
        );
      }

      // ------------------------------------------------
      // BASE PAYLOAD
      // ------------------------------------------------

      const payload = {
        name:
          formData.name.trim(),

        industry:
          formData.industry.trim(),

        location:
          formData.location.trim(),

        latitude:
          Number(formData.latitude),

        longitude:
          Number(formData.longitude),

        material_specification:
          formData.materialSpecification.trim() ||
          null,

        quality_notes:
          formData.qualityNotes.trim() ||
          null,

        quantity:
          Number(formData.quantity),

        unit:
          formData.unit,

        frequency:
          formData.frequency
      };

      // ------------------------------------------------
      // SUPPLIER MATERIAL
      // ------------------------------------------------

      if (
        registrationType === 'supplier'
      ) {
        payload.material =
          formData.material.trim();
      }

      // ------------------------------------------------
      // BUYER MATERIAL
      // ------------------------------------------------

      else {
        payload.material_needed =
          formData.material.trim();
      }

      // ------------------------------------------------
      // ENDPOINT
      // ------------------------------------------------

      const endpoint =
        registrationType === 'supplier'
          ? `${API_BASE_URL}/api/suppliers`
          : `${API_BASE_URL}/api/buyers`;

      // ------------------------------------------------
      // POST
      // ------------------------------------------------

      const response =
        await fetch(
          endpoint,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify(payload)
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
          data?.message ||
          'Registration failed.'
        );
      }

      // ------------------------------------------------
      // SUCCESS MESSAGE
      // ------------------------------------------------

      setFormMessage(
        registrationType === 'supplier'
          ? 'Supplier registered successfully!'
          : 'Buyer registered successfully!'
      );

      // ------------------------------------------------
      // REFRESH
      // ------------------------------------------------

      await loadData();

      // ------------------------------------------------
      // RESET
      // ------------------------------------------------

      resetForm();

      setLocationMessage('');
    } catch (err) {
      console.error(
        'Registration error:',
        err
      );

      setFormError(
        err.message ||
        'Something went wrong while registering.'
      );
    } finally {
      setFormLoading(false);
    }
  }

  // ==================================================
  // CLEAR FILTERS
  // ==================================================

  function clearFilters() {
    setQuery('');
    setMaterialFilter('all');
    setMinScore(0);
    setMaxDistance(9999);
  }

  // ==================================================
  // MAIN UI
  // ==================================================

  return (
    <div className="app">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="topbar">

        <div className="brand">

          <div className="logo">
            <Recycle size={22} />
          </div>

          <div>
            <strong>
              Udyam Sarthi
            </strong>

            <span>
              Industrial Symbiosis
            </span>
          </div>

        </div>

        <nav>

          <button
            className={
              tab === 'dashboard'
                ? 'active'
                : ''
            }
            onClick={() =>
              setTab('dashboard')
            }
          >
            Dashboard
          </button>

          <button
            className={
              tab === 'matches'
                ? 'active'
                : ''
            }
            onClick={() =>
              setTab('matches')
            }
          >
            Matches
          </button>

          <button
            className={
              tab === 'industries'
                ? 'active'
                : ''
            }
            onClick={() =>
              setTab('industries')
            }
          >
            Industries
          </button>

          <button
            className={
              tab === 'register'
                ? 'active'
                : ''
            }
            onClick={() =>
              setTab('register')
            }
          >
            Register
          </button>

          <button
            className={
              tab === 'about'
                ? 'active'
                : ''
            }
            onClick={() =>
              setTab('about')
            }
          >
            How it works
          </button>

        </nav>

      </header>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main>

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="hero">

          <div>

            <p className="eyebrow">
              CIRCULAR INDUSTRY NETWORK
            </p>

            <h1>
              Turn industrial
              <br />
              <em>
                by-products
              </em>{' '}
              into resources.
            </h1>

            <p className="hero-copy">
              Udyam Sarthi discovers potential
              resource exchanges between
              industries using material
              compatibility, quantity,
              location and frequency.
            </p>

            <div className="hero-actions">

              <button
                className="primary-button"
                onClick={() =>
                  setTab('matches')
                }
              >
                Explore matches
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  setTab('register')
                }
              >
                Join the network
              </button>

            </div>

          </div>

          <div className="hero-card">

            <div className="orbit">
              <Recycle size={40} />
            </div>

            <span>
              Potential exchange
            </span>

            <strong>
              Waste → Resource
            </strong>

            <small>
              AI-assisted industrial matching
            </small>

          </div>

        </section>


        {/* ==================================================
            STATS
        ================================================== */}

        <section className="stats">

          <Stat
            icon={<Factory />}
            value={
              suppliers.length +
              buyers.length
            }
            label="Network industries"
          />

          <Stat
            icon={<Recycle />}
            value={
              matches.length
            }
            label="Potential matches"
          />

          <Stat
            icon={<Package />}
            value={
              loading
                ? '...'
                : error
                  ? 'Offline'
                  : 'Live'
            }
            label="Backend status"
          />

          <Stat
            icon={<Leaf />}
            value="AI-ready"
            label="Recommendation layer"
          />

        </section>


        {/* ==================================================
            DASHBOARD
        ================================================== */}

        {tab === 'dashboard' && (

          <section className="dashboard">

            <div className="section-head">

              <div>

                <p className="eyebrow">
                  NETWORK OVERVIEW
                </p>

                <h2>
                  Industrial symbiosis dashboard
                </h2>

              </div>

            </div>


            <div className="dashboard-stats">

              <DashboardStat
                label="NETWORK INDUSTRIES"
                value={
                  suppliers.length +
                  buyers.length
                }
                text="Suppliers + buyers"
              />

              <DashboardStat
                label="SUPPLIERS"
                value={
                  suppliers.length
                }
                text="Resource providers"
              />

              <DashboardStat
                label="BUYERS"
                value={
                  buyers.length
                }
                text="Potential resource users"
              />

              <DashboardStat
                label="POTENTIAL MATCHES"
                value={
                  matches.length
                }
                text="Generated by matching engine"
              />

            </div>


            <div className="dashboard-grid">

              <div className="dashboard-panel">

                <p className="eyebrow">
                  MATCH QUALITY
                </p>

                <h3>
                  Recommendation distribution
                </h3>

                <QualityRow
                  label="Excellent"
                  value={
                    highCompatibilityMatches.length
                  }
                  total={
                    matches.length
                  }
                />

                <QualityRow
                  label="Good"
                  value={
                    goodCompatibilityMatches.length
                  }
                  total={
                    matches.length
                  }
                />

                <QualityRow
                  label="Potential"
                  value={
                    potentialMatches
                  }
                  total={
                    matches.length
                  }
                />

              </div>


              <div className="dashboard-panel">

                <p className="eyebrow">
                  NETWORK MIX
                </p>

                <h3>
                  Resource participants
                </h3>

                <div className="network-mix">

                  <MixItem
                    label="Suppliers"
                    value={
                      suppliers.length
                    }
                    total={
                      suppliers.length +
                      buyers.length
                    }
                  />

                  <MixItem
                    label="Buyers"
                    value={
                      buyers.length
                    }
                    total={
                      suppliers.length +
                      buyers.length
                    }
                  />

                </div>

              </div>

            </div>


            <div className="dashboard-panel">

              <div className="dashboard-panel-header">

                <div>

                  <p className="eyebrow">
                    TOP RECOMMENDATIONS
                  </p>

                  <h3>
                    Highest compatibility exchanges
                  </h3>

                </div>

                <button
                  className="dashboard-link"
                  onClick={() =>
                    setTab('matches')
                  }
                >
                  View all matches →
                </button>

              </div>


              <div className="top-matches">

                {matches
                  .slice()
                  .sort(
                    (a, b) =>
                      Number(
                        b.match_score || 0
                      ) -
                      Number(
                        a.match_score || 0
                      )
                  )
                  .slice(0, 5)
                  .map(
                    (match, index) => (

                      <div
                        className="top-match"
                        key={
                          `${match.supplier_id}-${match.buyer_id}-${index}`
                        }
                      >

                        <div className="top-match-rank">
                          #{index + 1}
                        </div>

                        <div className="top-match-info">

                          <strong>
                            {match.supplier_name}
                          </strong>

                          <span>
                            {match.material}
                          </span>

                        </div>

                        <ArrowRight
                          size={17}
                        />

                        <div className="top-match-info">

                          <strong>
                            {match.buyer_name}
                          </strong>

                          <span>
                            {match.buyer_industry}
                          </span>

                        </div>

                        <div className="top-match-score">
                          {match.match_score}/105
                        </div>

                      </div>

                    )
                  )}

                {matches.length === 0 && (

                  <div className="empty-state">

                    <div className="empty-state-title">
                      No matches available
                    </div>

                    <div className="empty-state-text">
                      Register suppliers and buyers
                      to generate potential exchanges.
                    </div>

                  </div>

                )}

              </div>

            </div>

          </section>

        )}


        {/* ==================================================
            MATCHES
        ================================================== */}

        {tab === 'matches' && (

          <section className="section">

            <div className="section-heading">

              <p className="section-eyebrow">
                RECOMMENDATIONS
              </p>

              <h2 className="section-title">
                Potential symbiosis matches
              </h2>

              <p className="section-description">
                Matches are ranked using material
                compatibility, quantity,
                geographical proximity,
                frequency and industry relevance.
              </p>

            </div>


            <div className="search-section">

              <div className="search-box">

                <Search
                  className="search-icon"
                  size={16}
                />

                <input
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search company, material or industry..."
                />

              </div>

            </div>


            <div className="match-filters">

              <div className="filter-field">

                <label>
                  Material
                </label>

                <select
                  value={materialFilter}
                  onChange={(event) =>
                    setMaterialFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="all">
                    All materials
                  </option>

                  {availableMaterials.map(
                    (material) => (

                      <option
                        key={material}
                        value={material}
                      >
                        {formatText(material)}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="filter-field">

                <label>
                  Minimum score
                </label>

                <select
                  value={minScore}
                  onChange={(event) =>
                    setMinScore(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >

                  <option value="0">
                    Any score
                  </option>

                  <option value="50">
                    50+
                  </option>

                  <option value="65">
                    65+
                  </option>

                  <option value="75">
                    75+
                  </option>

                  <option value="85">
                    85+
                  </option>

                  <option value="95">
                    95+
                  </option>

                </select>

              </div>


              <div className="filter-field">

                <label>
                  Maximum distance
                </label>

                <select
                  value={maxDistance}
                  onChange={(event) =>
                    setMaxDistance(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >

                  <option value="9999">
                    Any distance
                  </option>

                  <option value="5">
                    5 km
                  </option>

                  <option value="10">
                    10 km
                  </option>

                  <option value="25">
                    25 km
                  </option>

                  <option value="50">
                    50 km
                  </option>

                  <option value="100">
                    100 km
                  </option>

                </select>

              </div>


              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear
              </button>

            </div>


            {!loading &&
              !error && (

                <div className="matches-header">

                  <div>
                    <strong>
                      {filteredMatches.length}
                    </strong>{' '}
                    potential exchange
                    {filteredMatches.length === 1
                      ? ''
                      : 's'}
                  </div>

                </div>

              )}


            {loading && (

              <div className="loading">

                <div>

                  <div className="spinner" />

                  Loading live recommendations...

                </div>

              </div>

            )}


            {!loading &&
              error && (

                <div className="empty-state">

                  <div className="empty-state-title">
                    Backend connection problem
                  </div>

                  <div className="empty-state-text">
                    {error}
                  </div>

                </div>

              )}


            {!loading &&
              !error && (

                <div className="matches-list">

                  {filteredMatches.length === 0 ? (

                    <div className="empty-state">

                      <div className="empty-state-title">
                        No matching industries found
                      </div>

                      <div className="empty-state-text">
                        Try changing the search,
                        material, score or distance
                        filters.
                      </div>

                    </div>

                  ) : (

                    filteredMatches.map(
                      (match, index) => (

                        <MatchCard
                          key={
                            `${match.supplier_id}-${match.buyer_id}-${index}`
                          }
                          match={match}
                        />

                      )
                    )

                  )}

                </div>

              )}


            <p className="disclaimer">

              Recommendations are generated from
              the current database. Real exchanges
              require material testing, regulatory
              checks, logistics validation and
              expert approval.

            </p>

          </section>

        )}


        {/* ==================================================
            INDUSTRIES
        ================================================== */}

        {tab === 'industries' && (

          <section className="section">

            <div className="section-heading">

              <p className="section-eyebrow">
                NETWORK
              </p>

              <h2 className="section-title">
                Industry resource profiles
              </h2>

              <p className="section-description">
                Companies currently participating
                in the Udyam Sarthi network.
              </p>

            </div>


            <div className="industry-grid">

              {suppliers.map(
                (supplier) => (

                  <div
                    className="industry-card"
                    key={
                      `supplier-${supplier.id}`
                    }
                  >

                    <div className="industry-icon">

                      <Factory
                        size={17}
                      />

                    </div>

                    <div>

                      <h3 className="industry-name">
                        {supplier.name}
                      </h3>

                      <p className="industry-description">
                        Supplier · {supplier.material}
                      </p>

                      <p className="industry-description">
                        {supplier.industry}
                      </p>

                      <p className="industry-description">
                        <MapPin size={11} />{' '}
                        {supplier.location}
                      </p>

                      {supplier.material_specification && (

                        <p className="industry-description">
                          Specification:{' '}
                          {
                            supplier.material_specification
                          }
                        </p>

                      )}

                      {supplier.quality_notes && (

                        <p className="industry-description">
                          Quality:{' '}
                          {
                            supplier.quality_notes
                          }
                        </p>

                      )}

                    </div>

                  </div>

                )
              )}


              {buyers.map(
                (buyer) => (

                  <div
                    className="industry-card"
                    key={
                      `buyer-${buyer.id}`
                    }
                  >

                    <div className="industry-icon">

                      <Package
                        size={17}
                      />

                    </div>

                    <div>

                      <h3 className="industry-name">
                        {buyer.name}
                      </h3>

                      <p className="industry-description">
                        Potential buyer ·{' '}
                        {buyer.material_needed}
                      </p>

                      <p className="industry-description">
                        {buyer.industry}
                      </p>

                      <p className="industry-description">
                        <MapPin size={11} />{' '}
                        {buyer.location}
                      </p>

                      {buyer.material_specification && (

                        <p className="industry-description">
                          Specification:{' '}
                          {
                            buyer.material_specification
                          }
                        </p>

                      )}

                      {buyer.quality_notes && (

                        <p className="industry-description">
                          Quality:{' '}
                          {
                            buyer.quality_notes
                          }
                        </p>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        )}


        {/* ==================================================
            REGISTER
        ================================================== */}

        {tab === 'register' && (

          <section className="section">

            <div className="registration-wrapper">

              <div className="registration-info">

                <p className="section-eyebrow">
                  JOIN THE NETWORK
                </p>

                <h2 className="registration-info-title">
                  Register your industrial resource.
                </h2>

                <p className="registration-info-text">

                  Tell Udyam Sarthi what your
                  industry supplies or needs.
                  The platform then compares
                  the profile with potential
                  industrial partners.

                </p>

                <div className="registration-benefits">

                  <div className="registration-benefit">
                    <span className="benefit-dot" />
                    Material compatibility
                  </div>

                  <div className="registration-benefit">
                    <span className="benefit-dot" />
                    Quantity compatibility
                  </div>

                  <div className="registration-benefit">
                    <span className="benefit-dot" />
                    Location proximity
                  </div>

                  <div className="registration-benefit">
                    <span className="benefit-dot" />
                    Supply frequency
                  </div>

                  <div className="registration-benefit">
                    <span className="benefit-dot" />
                    Material specifications
                  </div>

                  <div className="registration-benefit">
                    <span className="benefit-dot" />
                    Quality information
                  </div>

                </div>

              </div>


              <div className="registration-form">

                <div className="registration-type">

                  <button
                    type="button"
                    className={
                      registrationType === 'supplier'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      changeRegistrationType(
                        'supplier'
                      )
                    }
                  >

                    <Recycle size={16} />

                    I have a by-product

                  </button>


                  <button
                    type="button"
                    className={
                      registrationType === 'buyer'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      changeRegistrationType(
                        'buyer'
                      )
                    }
                  >

                    <Package size={16} />

                    I need a material

                  </button>

                </div>


                {formMessage && (

                  <div className="form-message success">
                    {formMessage}
                  </div>

                )}


                {formError && (

                  <div className="form-message error">
                    {formError}
                  </div>

                )}


                <form
                  onSubmit={handleRegistration}
                >

                  <div className="form-grid">

                    {/* COMPANY */}

                    <div className="form-field">

                      <label>
                        Company name
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={
                          handleInputChange
                        }
                        placeholder="e.g. GreenForge Industries"
                        required
                      />

                    </div>


                    {/* INDUSTRY */}

                    <div className="form-field">

                      <label>
                        Industry
                      </label>

                      <input
                        type="text"
                        name="industry"
                        value={
                          formData.industry
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="e.g. Construction"
                        required
                      />

                    </div>


                    {/* LOCATION */}

                    <div className="form-field full">

                      <label>
                        Industrial location
                      </label>

                      <div className="location-box">

                        <input
                          type="text"
                          name="location"
                          value={
                            formData.location
                          }
                          onChange={(event) => {

                            handleInputChange(
                              event
                            );

                            setLocationMessage('');

                            setFormData(
                              (previous) => ({
                                ...previous,
                                latitude: '',
                                longitude: ''
                              })
                            );

                          }}
                          placeholder="e.g. Mumbai"
                          required
                        />


                        <button
                          type="button"
                          className="location-button"
                          onClick={
                            findLocation
                          }
                          disabled={
                            locationLoading
                          }
                        >

                          <MapPin size={14} />

                          {locationLoading
                            ? 'Finding...'
                            : 'Find'}

                        </button>

                      </div>


                      {locationMessage && (

                        <div
                          className={
                            locationMessage.startsWith(
                              '✓'
                            )
                              ? 'location-success'
                              : 'location-error'
                          }
                        >

                          <MapPin size={13} />

                          <span>
                            {locationMessage}
                          </span>

                        </div>

                      )}

                    </div>


                    {/* MATERIAL */}

                    <div className="form-field full">

                      <label>

                        {registrationType ===
                        'supplier'
                          ? 'Material generated'
                          : 'Material needed'}

                      </label>


                      <input
                        type="text"
                        name="material"
                        value={
                          formData.material
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="e.g. Fly Ash"
                        required
                      />

                    </div>


                    {/* MATERIAL SPECIFICATION */}

                    <div className="form-field">

                      <label>
                        Material specification
                      </label>

                      <input
                        type="text"
                        name="materialSpecification"
                        value={
                          formData.materialSpecification
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder={
                          registrationType ===
                          'supplier'
                            ? 'e.g. Grade F fly ash'
                            : 'e.g. Grade F or equivalent'
                        }
                      />

                      <small className="field-help">

                        Optional — grade, type,
                        composition or other
                        specification.

                      </small>

                    </div>


                    {/* QUALITY NOTES */}

                    <div className="form-field">

                      <label>
                        Quality notes
                      </label>

                      <textarea
                        name="qualityNotes"
                        value={
                          formData.qualityNotes
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder={
                          registrationType ===
                          'supplier'
                            ? 'e.g. Dry material, low moisture, suitable for cement blending'
                            : 'e.g. Prefer dry material with low moisture'
                        }
                        rows="4"
                      />

                      <small className="field-help">

                        Optional — describe
                        quality, condition or
                        requirements.

                      </small>

                    </div>


                    {/* QUANTITY */}

                    <div className="form-field">

                      <label>
                        Quantity
                      </label>

                      <input
                        type="number"
                        name="quantity"
                        value={
                          formData.quantity
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="e.g. 1500"
                        min="1"
                        step="any"
                        required
                      />

                    </div>


                    {/* UNIT */}

                    <div className="form-field">

                      <label>
                        Unit
                      </label>

                      <select
                        name="unit"
                        value={
                          formData.unit
                        }
                        onChange={
                          handleInputChange
                        }
                      >

                        <option value="kg/month">
                          kg/month
                        </option>

                        <option value="kg/day">
                          kg/day
                        </option>

                        <option value="ton/month">
                          ton/month
                        </option>

                        <option value="ton/day">
                          ton/day
                        </option>

                      </select>

                    </div>


                    {/* FREQUENCY */}

                    <div className="form-field">

                      <label>
                        Frequency
                      </label>

                      <select
                        name="frequency"
                        value={
                          formData.frequency
                        }
                        onChange={
                          handleInputChange
                        }
                      >

                        <option value="Daily">
                          Daily
                        </option>

                        <option value="Weekly">
                          Weekly
                        </option>

                        <option value="Monthly">
                          Monthly
                        </option>

                      </select>

                    </div>

                  </div>


                  {/* LOCATION HELP */}

                  <div className="location-help">

                    <MapPin size={15} />

                    <span>

                      Enter your industrial
                      location and click{' '}

                      <strong>
                        Find
                      </strong>{' '}

                      so Udyam Sarthi can
                      estimate the distance
                      between potential partners.

                    </span>

                  </div>


                  {/* SUBMIT */}

                  <button
                    type="submit"
                    className="form-submit"
                    disabled={formLoading}
                  >

                    {formLoading
                      ? 'Registering...'
                      : registrationType ===
                        'supplier'
                        ? 'Register as Supplier'
                        : 'Register as Buyer'}

                  </button>

                </form>

              </div>

            </div>

          </section>

        )}


        {/* ==================================================
            HOW IT WORKS
        ================================================== */}

        {tab === 'about' && (

          <section className="section">

            <div className="section-heading">

              <p className="section-eyebrow">
                HOW IT WORKS
              </p>

              <h2 className="section-title">
                From industrial by-product
                to potential resource exchange.
              </h2>

              <p className="section-description">

                Udyam Sarthi creates a structured
                bridge between industrial supply
                and demand.

              </p>

            </div>


            <div className="steps">

              <Step
                number="01"
                title="Register"
                text="A supplier or buyer creates a resource profile."
              />

              <Step
                number="02"
                title="Describe"
                text="Material, quantity, location, frequency and optional specifications are recorded."
              />

              <Step
                number="03"
                title="Match"
                text="The engine compares material, quantity, distance, frequency and industry relevance."
              />

              <Step
                number="04"
                title="Review"
                text="Potential partners receive a ranked compatibility score for further validation."
              />

            </div>


            <div className="panel how">

              <p className="eyebrow">
                THE PROBLEM
              </p>

              <h2>
                Who can use my industrial by-product?
              </h2>

              <p>

                One industry may generate a
                by-product while another industry
                requires a similar input. Udyam
                Sarthi helps discover those
                possible connections.

              </p>


              <div className="flow">

                <Flow
                  title="Industry A"
                  text="Generates a by-product"
                />

                <ArrowRight />

                <Flow
                  title="Matching engine"
                  text="Compatibility + quantity + distance + frequency"
                />

                <ArrowRight />

                <Flow
                  title="Industry B"
                  text="Needs an input"
                />

              </div>

            </div>

          </section>

        )}

      </main>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="footer">

        <div className="container footer-inner">

          <span className="footer-text">
            Udyam Sarthi · Industrial Symbiosis
          </span>

          <span className="footer-brand">
            AI-assisted resource matching
          </span>

        </div>

      </footer>

    </div>
  );
}


// ============================================================
// STAT COMPONENT
// ============================================================

function Stat({
  icon,
  value,
  label
}) {
  return (
    <div className="stat">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

      </div>

    </div>
  );
}


// ============================================================
// DASHBOARD STAT
// ============================================================

function DashboardStat({
  label,
  value,
  text
}) {
  return (
    <div className="dashboard-stat">

      <span className="dashboard-stat-label">
        {label}
      </span>

      <strong className="dashboard-stat-value">
        {value}
      </strong>

      <small className="dashboard-stat-text">
        {text}
      </small>

    </div>
  );
}


// ============================================================
// QUALITY ROW
// ============================================================

function QualityRow({
  label,
  value,
  total
}) {
  const percentage =
    total > 0
      ? Math.min(
          100,
          (value / total) * 100
        )
      : 0;

  return (
    <div className="quality-row">

      <div>

        <span className="quality-name">
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

      <div className="dashboard-bar">

        <div
          className="dashboard-bar-fill"
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

    </div>
  );
}


// ============================================================
// MIX ITEM
// ============================================================

function MixItem({
  label,
  value,
  total
}) {
  const percentage =
    total > 0
      ? Math.min(
          100,
          (value / total) * 100
        )
      : 0;

  return (
    <div className="mix-item">

      <div className="mix-top">

        <span className="mix-name">
          {label}
        </span>

        <strong className="mix-value">
          {value}
        </strong>

      </div>

      <div className="dashboard-bar">

        <div
          className="dashboard-bar-fill"
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

    </div>
  );
}


// ============================================================
// MATCH CARD
// ============================================================

function MatchCard({
  match: m
}) {
  const supplierQuantity =
    Number(
      m.supplier_quantity || 0
    );

  const buyerQuantity =
    Number(
      m.buyer_quantity_needed || 0
    );

  const potentialExchange =
    Math.min(
      supplierQuantity,
      buyerQuantity
    );

  let matchLevel =
    'Moderate Match';

  if (
    Number(m.match_score || 0) >= 85
  ) {
    matchLevel =
      'Excellent Match';
  } else if (
    Number(m.match_score || 0) >= 65
  ) {
    matchLevel =
      'Good Match';
  }

  return (
    <article className="match-card">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="match-card-header">

        <div>

          <span className="match-label">
            RECOMMENDED EXCHANGE
          </span>

          <h2 className="match-level">
            {matchLevel}
          </h2>

        </div>

        <div className="match-score-badge">

          <strong>
            {m.match_score}
          </strong>

          <span>
            / 105
          </span>

        </div>

      </div>


      {/* ==================================================
          SUPPLIER → BUYER
      ================================================== */}

      <div className="match-main">

        <div className="company">

          <div className="mini-icon">

            <Factory
              size={18}
            />

          </div>

          <div>

            <small>
              SUPPLIER
            </small>

            <h3>
              {m.supplier_name}
            </h3>

            <p>

              <MapPin
                size={13}
              />

              {' '}

              {m.supplier_location}

            </p>

          </div>

        </div>


        <div className="arrow">

          <ArrowRight
            size={20}
          />

        </div>


        <div className="company">

          <div className="mini-icon">

            <Package
              size={18}
            />

          </div>

          <div>

            <small>
              POTENTIAL USER
            </small>

            <h3>
              {m.buyer_name}
            </h3>

            <p>

              <MapPin
                size={13}
              />

              {' '}

              {m.buyer_location}

            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          EXCHANGE SUMMARY
      ================================================== */}

      <div className="exchange-summary">

        <div>

          <span>
            MATERIAL
          </span>

          <strong>
            {m.material || '-'}
          </strong>

        </div>


        <div>

          <span>
            AVAILABLE
          </span>

          <strong>

            {formatNumber(
              supplierQuantity
            )}{' '}

            {m.supplier_unit || ''}

          </strong>

        </div>


        <div>

          <span>
            REQUIRED
          </span>

          <strong>

            {formatNumber(
              buyerQuantity
            )}{' '}

            {m.buyer_unit || ''}

          </strong>

        </div>


        <div>

          <span>
            POTENTIAL EXCHANGE
          </span>

          <strong>

            {formatNumber(
              potentialExchange
            )}{' kg'}

          </strong>

        </div>

      </div>


      {/* ==================================================
          WHY THIS MATCH
      ================================================== */}

      <div className="match-explanation">

        <div className="explanation-title">
          WHY THIS MATCH?
        </div>


        {/* MATERIAL */}

        <ScoreRow

          icon="♻️"

          title="Material compatibility"

          subtitle={
            `${m.material || '-'} → ${
              m.buyer_material_needed || '-'
            }`
          }

          detail={
            `Rule-based: ${
              m.traditional_material_score ?? 0
            }/45 · AI semantic: ${
              m.ai_material_score ?? 0
            }/45`
          }

          score={
            m.material_score
          }

          maximum={45}

        />


        {/* SPECIFICATION */}

        {(m.supplier_material_specification ||
          m.buyer_material_specification) && (

          <div className="score-row">

            <div className="score-info">

              <span>
                🧪 Material specification
              </span>

              <small>

                Supplier:{' '}
                {
                  m.supplier_material_specification ||
                  'Not provided'
                }

              </small>

              <small>

                Buyer:{' '}
                {
                  m.buyer_material_specification ||
                  'Not provided'
                }

              </small>

            </div>

            {m.specification_score !==
              undefined && (

              <div className="score-value">

                <strong>

                  {m.specification_score}

                  {m.specification_max_score
                    ? `/${m.specification_max_score}`
                    : ''}

                </strong>

              </div>

            )}

          </div>

        )}


        {/* QUALITY */}

        {(m.supplier_quality_notes ||
          m.buyer_quality_notes) && (

          <div className="score-row">

            <div className="score-info">

              <span>
                🧾 Quality information
              </span>

              <small>

                Supplier:{' '}
                {
                  m.supplier_quality_notes ||
                  'Not provided'
                }

              </small>

              <small>

                Buyer:{' '}
                {
                  m.buyer_quality_notes ||
                  'Not provided'
                }

              </small>

            </div>

          </div>

        )}


        {/* QUANTITY */}

        <ScoreRow

          icon="📦"

          title="Quantity compatibility"

          subtitle="Supply vs. demand"

          detail={
            `${formatNumber(
              supplierQuantity
            )} vs. ${formatNumber(
              buyerQuantity
            )}`
          }

          score={
            m.quantity_score
          }

          maximum={25}

        />


        {/* DISTANCE */}

        <ScoreRow

          icon="📍"

          title="Geographic proximity"

          subtitle={
            `${m.distance_km ?? 0} km apart`
          }

          detail={
            'Lower transport distance receives a higher score.'
          }

          score={
            m.distance_score
          }

          maximum={20}

        />


        {/* FREQUENCY */}

        <ScoreRow

          icon="🔄"

          title="Supply frequency"

          subtitle={
            `${m.supplier_frequency || '-'} ↔ ${
              m.buyer_frequency || '-'
            }`
          }

          detail="Frequency alignment"

          score={
            m.frequency_score
          }

          maximum={10}

        />


        {/* INDUSTRY */}

        <ScoreRow

          icon="🏭"

          title="Industry compatibility"

          subtitle={
            `${m.supplier_industry || '-'} → ${
              m.buyer_industry || '-'
            }`
          }

          detail="Industry relevance"

          score={
            m.industry_score
          }

          maximum={5}

        />

      </div>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="match-footer">

        <span>

          Live recommendation from
          the Udyam Sarthi matching engine

        </span>

        <strong>

          {getCompatibilityLabel(
            m.match_score
          )}

        </strong>

      </div>

    </article>
  );
}


// ============================================================
// SCORE ROW
// ============================================================

function ScoreRow({
  icon,
  title,
  subtitle,
  detail,
  score,
  maximum
}) {
  const numericScore =
    Number(score ?? 0);

  const numericMaximum =
    Number(maximum ?? 0);

  const percentage =
    numericMaximum > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (
              numericScore /
              numericMaximum
            ) * 100
          )
        )
      : 0;

  return (
    <div className="score-row">

      <div className="score-info">

        <span>
          {icon}{' '}
          {title}
        </span>

        {subtitle && (
          <small>
            {subtitle}
          </small>
        )}

        {detail && (
          <small className="ai-detail">
            {detail}
          </small>
        )}

      </div>


      <div className="score-value">

        <strong>

          {numericMaximum > 0
            ? `${numericScore}/${numericMaximum}`
            : `${numericScore}`}

        </strong>

        {numericMaximum > 0 && (

          <div className="score-bar">

            <div
              style={{
                width: `${percentage}%`
              }}
            />

          </div>

        )}

      </div>

    </div>
  );
}


// ============================================================
// STEP
// ============================================================

function Step({
  number,
  title,
  text
}) {
  return (
    <div className="step">

      <div className="step-number">
        {number}
      </div>

      <h3 className="step-title">
        {title}
      </h3>

      <p className="step-description">
        {text}
      </p>

    </div>
  );
}


// ============================================================
// FLOW
// ============================================================

function Flow({
  title,
  text
}) {
  return (
    <div className="flow-box">

      <strong>
        {title}
      </strong>

      <span>
        {text}
      </span>

    </div>
  );
}


// ============================================================
// FORMAT TEXT
// ============================================================

function formatText(value) {
  if (!value) {
    return '';
  }

  return String(value).replace(
    /\b\w/g,
    (letter) =>
      letter.toUpperCase()
  );
}


// ============================================================
// FORMAT NUMBER
// ============================================================

function formatNumber(value) {
  return Number(
    value || 0
  ).toLocaleString('en-IN');
}


// ============================================================
// COMPATIBILITY LABEL
// ============================================================

function getCompatibilityLabel(score) {
  const numericScore =
    Number(score || 0);

  if (numericScore >= 85) {
    return 'High compatibility';
  }

  if (numericScore >= 65) {
    return 'Good compatibility';
  }

  return 'Potential compatibility';
}


// ============================================================
// RENDER
// ============================================================

createRoot(
  document.getElementById('root')
).render(
  <App />
);