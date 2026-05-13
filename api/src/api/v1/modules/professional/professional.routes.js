const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Professional Module' }));

module.exports = router;
