const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);


// PostgreSQL connection using Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Neon
});

// Test route
app.get('/', (req, res) => {
  res.send('SheepBreedingKashmir backend is running.');
});

// GET all farms
app.get('/api/farms', async (req, res) => {
  try {
    console.log('Connecting to:', process.env.DATABASE_URL);
    const result = await pool.query('SELECT * FROM "farms"'); // case-sensitive
    console.log('Farms result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying farms:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});
// POST /api/farms - Add a new farm
app.post('/api/farms', async (req, res) => {
  const { name, location, manager_name, contact_info } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO farms (name, location, manager_name, contact_info) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, location, manager_name, contact_info]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting farm:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/farms/:id - Update farm by ID
app.put('/api/farms/:id', async (req, res) => {
  const farmId = req.params.id;
  const { name, location, manager_name, contact_info } = req.body;

  try {
    const result = await pool.query(
      'UPDATE farms SET name = $1, location = $2, manager_name = $3, contact_info = $4 WHERE id = $5 RETURNING *',
      [name, location, manager_name, contact_info, farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating farm:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/farms/:id - Delete farm by ID
app.delete('/api/farms/:id', async (req, res) => {
  const farmId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM farms WHERE id = $1 RETURNING *',
      [farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json({ message: 'Farm deleted successfully' });
  } catch (err) {
    console.error('Error deleting farm:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// BREEDS ROUTES
// =======================

// GET all breeds
app.get('/api/breeds', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM breeds');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting breeds:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST a new breed
app.post('/api/breeds', async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO breeds (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding breed:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT (update) a breed by ID
app.put('/api/breeds/:id', async (req, res) => {
  const breedId = req.params.id;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE breeds SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, breedId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Breed not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating breed:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a breed by ID
app.delete('/api/breeds/:id', async (req, res) => {
  const breedId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM breeds WHERE id = $1 RETURNING *',
      [breedId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Breed not found' });
    }
    res.json({ message: 'Breed deleted successfully' });
  } catch (err) {
    console.error('Error deleting breed:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// BRANDING ROUTES
// =======================

// GET all animals
app.get('/api/branding', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branding ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting branding data:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new animal
app.post('/api/branding', async (req, res) => {
  const {
    tag_number,
    branding_id,
    branding_date,
    gender,
    breed_id,
    farm_id,
    dob,
    sire_branding_id,
    dam_branding_id,
    notes,
    current_status
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO branding 
      (tag_number, branding_id, branding_date, gender, breed_id, farm_id, dob, sire_branding_id, dam_branding_id, notes, current_status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [tag_number, branding_id, branding_date, gender, breed_id, farm_id, dob, sire_branding_id, dam_branding_id, notes, current_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding animal:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update animal by ID
app.put('/api/branding/:id', async (req, res) => {
  const animalId = req.params.id;
  const {
    tag_number,
    branding_id,
    branding_date,
    gender,
    breed_id,
    farm_id,
    dob,
    sire_branding_id,
    dam_branding_id,
    notes,
    current_status
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE branding SET
      tag_number = $1,
      branding_id = $2,
      branding_date = $3,
      gender = $4,
      breed_id = $5,
      farm_id = $6,
      dob = $7,
      sire_branding_id = $8,
      dam_branding_id = $9,
      notes = $10,
      current_status = $11
      WHERE id = $12 RETURNING *`,
      [tag_number, branding_id, branding_date, gender, breed_id, farm_id, dob, sire_branding_id, dam_branding_id, notes, current_status, animalId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating animal:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE animal by ID
app.delete('/api/branding/:id', async (req, res) => {
  const animalId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM branding WHERE id = $1 RETURNING *',
      [animalId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.json({ message: 'Animal deleted successfully' });
  } catch (err) {
    console.error('Error deleting animal:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// LAMBINGS ROUTES
// =======================

// GET all lambing records
app.get('/api/lambings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lambings ORDER BY lambing_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting lambings:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new lambing record
app.post('/api/lambings', async (req, res) => {
  const { dam_branding_id, sire_branding_id, lambing_date, number_of_lambs, notes } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO lambings (dam_branding_id, sire_branding_id, lambing_date, number_of_lambs, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dam_branding_id, sire_branding_id, lambing_date, number_of_lambs, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding lambing:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update lambing record
app.put('/api/lambings/:id', async (req, res) => {
  const id = req.params.id;
  const { dam_branding_id, sire_branding_id, lambing_date, number_of_lambs, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE lambings SET
        dam_branding_id = $1,
        sire_branding_id = $2,
        lambing_date = $3,
        number_of_lambs = $4,
        notes = $5
       WHERE id = $6 RETURNING *`,
      [dam_branding_id, sire_branding_id, lambing_date, number_of_lambs, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lambing not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating lambing:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE lambing record
app.delete('/api/lambings/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM lambings WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lambing not found' });
    }

    res.json({ message: 'Lambing deleted successfully' });
  } catch (err) {
    console.error('Error deleting lambing:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// LAMBS ROUTES
// =======================

// GET all lambs
app.get('/api/lambs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lambs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting lambs:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new lamb
app.post('/api/lambs', async (req, res) => {
  const { tag_number, lambing_id, birth_weight, birth_type, vigor_score, notes } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO lambs (tag_number, lambing_id, birth_weight, birth_type, vigor_score, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tag_number, lambing_id, birth_weight, birth_type, vigor_score, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding lamb:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update lamb
app.put('/api/lambs/:id', async (req, res) => {
  const id = req.params.id;
  const { tag_number, lambing_id, birth_weight, birth_type, vigor_score, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE lambs SET
        tag_number = $1,
        lambing_id = $2,
        birth_weight = $3,
        birth_type = $4,
        vigor_score = $5,
        notes = $6
       WHERE id = $7 RETURNING *`,
      [tag_number, lambing_id, birth_weight, birth_type, vigor_score, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lamb not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating lamb:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE lamb
app.delete('/api/lambs/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM lambs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lamb not found' });
    }

    res.json({ message: 'Lamb deleted successfully' });
  } catch (err) {
    console.error('Error deleting lamb:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GROWTH ROUTES
// =======================

// GET all growth records
app.get('/api/growth', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM growth ORDER BY recorded_on DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting growth data:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new growth record
app.post('/api/growth', async (req, res) => {
  const { tag_number, branding_id, age_days, body_weight, recorded_on } = req.body;

  // Validation: only tag OR brand, not both
  if ((tag_number && branding_id) || (!tag_number && !branding_id)) {
    return res.status(400).json({ error: 'Provide either tag_number or branding_id (not both or none)' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO growth (tag_number, branding_id, age_days, body_weight, recorded_on)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tag_number || null, branding_id || null, age_days, body_weight, recorded_on]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding growth:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update growth record
app.put('/api/growth/:id', async (req, res) => {
  const id = req.params.id;
  const { tag_number, branding_id, age_days, body_weight, recorded_on } = req.body;

  if ((tag_number && branding_id) || (!tag_number && !branding_id)) {
    return res.status(400).json({ error: 'Provide either tag_number or branding_id (not both or none)' });
  }

  try {
    const result = await pool.query(
      `UPDATE growth SET
        tag_number = $1,
        branding_id = $2,
        age_days = $3,
        body_weight = $4,
        recorded_on = $5
       WHERE id = $6 RETURNING *`,
      [tag_number || null, branding_id || null, age_days, body_weight, recorded_on, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Growth record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating growth:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE growth record
app.delete('/api/growth/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM growth WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Growth record not found' });
    }

    res.json({ message: 'Growth record deleted successfully' });
  } catch (err) {
    console.error('Error deleting growth:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// HEALTH EVENTS ROUTES
// =======================

// GET all health events
app.get('/api/healthevents', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM healthevents ORDER BY event_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting health events:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new health event
app.post('/api/healthevents', async (req, res) => {
  const { tag_number, branding_id, event_date, event_type, description } = req.body;

  if ((tag_number && branding_id) || (!tag_number && !branding_id)) {
    return res.status(400).json({ error: 'Provide either tag_number or branding_id (not both or none)' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO healthevents (tag_number, branding_id, event_date, event_type, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tag_number || null, branding_id || null, event_date, event_type, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding health event:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update health event
app.put('/api/healthevents/:id', async (req, res) => {
  const id = req.params.id;
  const { tag_number, branding_id, event_date, event_type, description } = req.body;

  if ((tag_number && branding_id) || (!tag_number && !branding_id)) {
    return res.status(400).json({ error: 'Provide either tag_number or branding_id (not both or none)' });
  }

  try {
    const result = await pool.query(
      `UPDATE healthevents SET
        tag_number = $1,
        branding_id = $2,
        event_date = $3,
        event_type = $4,
        description = $5
       WHERE id = $6 RETURNING *`,
      [tag_number || null, branding_id || null, event_date, event_type, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Health event not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating health event:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE health event
app.delete('/api/healthevents/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM healthevents WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Health event not found' });
    }

    res.json({ message: 'Health event deleted successfully' });
  } catch (err) {
    console.error('Error deleting health event:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// WOOL RECORDS ROUTES
// =======================

// GET all wool records
app.get('/api/woolrecords', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM WoolRecords ORDER BY record_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting wool records:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new wool record
app.post('/api/woolrecords', async (req, res) => {
  const {
    branding_id,
    record_date,
    greasy_fleece_yield,
    clean_fleece_yield,
    staple_length,
    fibre_diameter,
    medullation_percent,
    crimps
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO WoolRecords (
        branding_id, record_date, greasy_fleece_yield,
        clean_fleece_yield, staple_length, fibre_diameter,
        medullation_percent, crimps)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        branding_id,
        record_date,
        greasy_fleece_yield,
        clean_fleece_yield,
        staple_length,
        fibre_diameter,
        medullation_percent,
        crimps
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding wool record:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update wool record
app.put('/api/woolrecords/:id', async (req, res) => {
  const id = req.params.id;
  const {
    branding_id,
    record_date,
    greasy_fleece_yield,
    clean_fleece_yield,
    staple_length,
    fibre_diameter,
    medullation_percent,
    crimps
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE WoolRecords SET
        branding_id = $1,
        record_date = $2,
        greasy_fleece_yield = $3,
        clean_fleece_yield = $4,
        staple_length = $5,
        fibre_diameter = $6,
        medullation_percent = $7,
        crimps = $8
       WHERE id = $9 RETURNING *`,
      [
        branding_id,
        record_date,
        greasy_fleece_yield,
        clean_fleece_yield,
        staple_length,
        fibre_diameter,
        medullation_percent,
        crimps,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wool record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating wool record:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE wool record
app.delete('/api/woolrecords/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM WoolRecords WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wool record not found' });
    }

    res.json({ message: 'Wool record deleted successfully' });
  } catch (err) {
    console.error('Error deleting wool record:', err);
    res.status(500).json({ error: err.message });
  }
});
// =======================
// WOOL RECORDS ROUTES
// =======================

// GET all wool records
app.get('/api/woolrecords', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM woolrecords ORDER BY record_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting wool records:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new wool record
app.post('/api/woolrecords', async (req, res) => {
  const {
    branding_id,
    record_date,
    greasy_fleece_yield,
    clean_fleece_yield,
    staple_length,
    fibre_diameter,
    medullation_percent,
    crimps
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO woolrecords (
        branding_id, record_date, greasy_fleece_yield,
        clean_fleece_yield, staple_length, fibre_diameter,
        medullation_percent, crimps)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        branding_id,
        record_date,
        greasy_fleece_yield,
        clean_fleece_yield,
        staple_length,
        fibre_diameter,
        medullation_percent,
        crimps
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding wool record:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update wool record
app.put('/api/woolrecords/:id', async (req, res) => {
  const id = req.params.id;
  const {
    branding_id,
    record_date,
    greasy_fleece_yield,
    clean_fleece_yield,
    staple_length,
    fibre_diameter,
    medullation_percent,
    crimps
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE woolrecords SET
        branding_id = $1,
        record_date = $2,
        greasy_fleece_yield = $3,
        clean_fleece_yield = $4,
        staple_length = $5,
        fibre_diameter = $6,
        medullation_percent = $7,
        crimps = $8
       WHERE id = $9 RETURNING *`,
      [
        branding_id,
        record_date,
        greasy_fleece_yield,
        clean_fleece_yield,
        staple_length,
        fibre_diameter,
        medullation_percent,
        crimps,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wool record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating wool record:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE wool record
app.delete('/api/woolrecords/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM woolrecords WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wool record not found' });
    }

    res.json({ message: 'Wool record deleted successfully' });
  } catch (err) {
    console.error('Error deleting wool record:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// MORTALITY ROUTES
// =======================

// GET all mortality records
app.get('/api/mortality', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mortality ORDER BY date_of_death DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting mortality:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new mortality record
app.post('/api/mortality', async (req, res) => {
  const { tag_number, branding_id, date_of_death, cause_of_death } = req.body;

  if ((tag_number && branding_id) || (!tag_number && !branding_id)) {
    return res.status(400).json({ error: 'Provide either tag_number or branding_id (not both or none)' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO mortality (tag_number, branding_id, date_of_death, cause_of_death)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tag_number || null, branding_id || null, date_of_death, cause_of_death]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding mortality:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update mortality record
app.put('/api/mortality/:id', async (req, res) => {
  const id = req.params.id;
  const { tag_number, branding_id, date_of_death, cause_of_death } = req.body;

  if ((tag_number && branding_id) || (!tag_number && !branding_id)) {
    return res.status(400).json({ error: 'Provide either tag_number or branding_id (not both or none)' });
  }

  try {
    const result = await pool.query(
      `UPDATE mortality SET
        tag_number = $1,
        branding_id = $2,
        date_of_death = $3,
        cause_of_death = $4
       WHERE id = $5 RETURNING *`,
      [tag_number || null, branding_id || null, date_of_death, cause_of_death, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mortality record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating mortality:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE mortality record
app.delete('/api/mortality/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM mortality WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mortality record not found' });
    }

    res.json({ message: 'Mortality record deleted successfully' });
  } catch (err) {
    console.error('Error deleting mortality:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// TRANSFER ROUTES
// =======================

// GET all transfer records
app.get('/api/transfers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transfers ORDER BY transfer_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting transfers:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new transfer record
app.post('/api/transfers', async (req, res) => {
  const { branding_id, transfer_date, from_farm_id, to_farm_id, reason } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO transfers (branding_id, transfer_date, from_farm_id, to_farm_id, reason)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [branding_id, transfer_date, from_farm_id, to_farm_id, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding transfer:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update transfer record
app.put('/api/transfers/:id', async (req, res) => {
  const id = req.params.id;
  const { branding_id, transfer_date, from_farm_id, to_farm_id, reason } = req.body;

  try {
    const result = await pool.query(
      `UPDATE transfers SET
        branding_id = $1,
        transfer_date = $2,
        from_farm_id = $3,
        to_farm_id = $4,
        reason = $5
       WHERE id = $6 RETURNING *`,
      [branding_id, transfer_date, from_farm_id, to_farm_id, reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transfer record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating transfer:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE transfer record
app.delete('/api/transfers/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM transfers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transfer record not found' });
    }

    res.json({ message: 'Transfer record deleted successfully' });
  } catch (err) {
    console.error('Error deleting transfer:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add more endpoints here (POST, PUT, DELETE, etc.)

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
