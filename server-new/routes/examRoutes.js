const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Exam routes placeholder' });
});

module.exports = router;