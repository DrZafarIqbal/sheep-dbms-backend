const express = require('express');
const router = express.Router();
const pool = require('../db');

// Utility to get start of current month
const getStartOfMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`;
};

router.get('/summary', async (req, res) => {
  try {
    const startOfMonth = getStartOfMonth();

    // Count by category (assuming branding table and age logic)
    const lambsQuery = `SELECT COUNT(*) FROM Lambs;`;
    const weanersQuery = `SELECT COUNT(*) FROM Lambs WHERE age_in_days BETWEEN 60 AND 179;`; // Example
    const hoggetsQuery = `SELECT COUNT(*) FROM Branding WHERE EXTRACT(YEAR FROM AGE(NOW(), branding_date)) = 1;`;
    const adultsQuery = `SELECT COUNT(*) FROM Branding WHERE EXTRACT(YEAR FROM AGE(NOW(), branding_date)) >= 2;`;

    // Mortality
    const deathsThisMonthQuery = `SELECT COUNT(*) FROM Mortality WHERE date_of_death >= $1;`;
    const totalDeathsQuery = `SELECT COUNT(*) FROM Mortality;`;

    // Transfers
    const transfersThisMonthQuery = `SELECT COUNT(*) FROM Transfers WHERE transfer_date >= $1;`;

    const [
      lambsResult,
      weanersResult,
      hoggetsResult,
      adultsResult,
      deathsThisMonthResult,
      totalDeathsResult,
      transfersThisMonthResult
    ] = await Promise.all([
      pool.query(lambsQuery),
      pool.query(weanersQuery),
      pool.query(hoggetsQuery),
      pool.query(adultsQuery),
      pool.query(deathsThisMonthQuery, [startOfMonth]),
      pool.query(totalDeathsQuery),
      pool.query(transfersThisMonthQuery, [startOfMonth])
    ]);

    res.json({
      lambs: lambsResult.rows[0].count,
      weaners: weanersResult.rows[0].count,
      hoggets: hoggetsResult.rows[0].count,
      adults: adultsResult.rows[0].count,
      deathsThisMonth: deathsThisMonthResult.rows[0].count,
      totalDeaths: totalDeathsResult.rows[0].count,
      transfersThisMonth: transfersThisMonthResult.rows[0].count
    });

  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
