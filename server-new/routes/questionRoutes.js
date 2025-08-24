const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const questionController = require('../controllers/questionController');

router.get('/', (req, res) => {
  res.json({ message: 'Question routes placeholder' });
});

// Create, update, delete questions (Teachers only)
router.post('/', auth, roleCheck('Teacher'), questionController.createQuestion);
router.put('/:id', auth, roleCheck('Teacher'), questionController.updateQuestion);
router.delete('/:id', auth, roleCheck('Teacher'), questionController.deleteQuestion);

module.exports = router;
