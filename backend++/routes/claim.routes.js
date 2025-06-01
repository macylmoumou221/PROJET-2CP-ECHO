const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claim.controller');
const { protect } = require('../middleware/auth.middleware');

// Student: Create a claim
router.post('/', protect, claimController.createClaim);

// Student: Get my claims
router.get('/my-claims', protect, claimController.getMyClaims);

// Teacher: Get claims addressed to me
router.get('/received', protect, claimController.getClaimsForTeacher);

// Teacher: Respond to a claim
router.put('/:claimId/respond', protect, claimController.respondToClaim);

// Get a specific claim
router.get('/:claimId', protect, claimController.getClaim);

module.exports = router;