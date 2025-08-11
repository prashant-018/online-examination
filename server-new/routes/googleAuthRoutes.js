const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Google auth routes placeholder' });
});

module.exports = router;