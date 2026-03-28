const express = require('express');
const router = express.Router();
// 1. Import the new function
const { createCommission, getUserCommissions, updateCommissionStatus } = require('../controllers/commissionController');

router.post('/', createCommission);
router.get('/user/:userId', getUserCommissions);
// --- ADD THIS NEW ROUTE ---
router.put('/:id/status', updateCommissionStatus);

module.exports = router;