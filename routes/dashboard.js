const express = require('express');
const router = express.Router();
const pool = require('../db');

// Utility: Calculate age in days from DOB
const getAgeDaysSQL = `DATE_PART('day', CURRENT_DATE - dob)`;

router.get('/population-summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.name AS farm_name,
        COUNT(CASE WHEN b.dob IS NOT NULL AND ${getAgeDaysSQL} < 90 THEN 1 END) AS lambs,
        COUNT(CASE WHEN ${getAgeDaysSQL} >= 90 AND ${getAgeDaysSQL} < 180 THEN 1 END) AS weaners,
        COUNT(CASE WHEN ${getAgeDaysSQL} >= 180 AND ${getAgeDaysSQL} < 365 THEN 1 END) AS hoggets,
        COUNT(CASE WHEN ${getAgeDaysSQL} >= 365 THEN 1 END) AS adults,
        COUNT(CASE WHEN b.gender = 'Male' THEN 1 END) AS males,
        COUNT(CASE WHEN b.gender = 'Female' THEN 1 END) AS females
      FROM Branding b
      JOIN Farms f ON b.farm_id = f.id
      WHERE b.current_status = 'Alive'
      GROUP BY f.name
      ORDER BY f.name
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching population summary:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
