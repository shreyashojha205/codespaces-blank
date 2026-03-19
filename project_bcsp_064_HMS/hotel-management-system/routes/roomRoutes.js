const express = require('express');
const {
  searchRooms,
  listRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
} = require('../controllers/roomController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { ensureRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public: search availability
router.get('/search', ensureAuthenticated, searchRooms);

// Manager only
router.get('/types', ensureRole(['Manager']), listRoomTypes);
router.post('/types', ensureRole(['Manager']), createRoomType);
router.put('/types/:id', ensureRole(['Manager']), updateRoomType);
router.delete('/types/:id', ensureRole(['Manager']), deleteRoomType);

router.get('/', ensureRole(['Manager']), listRooms);
router.post('/', ensureRole(['Manager']), createRoom);
router.put('/:id', ensureRole(['Manager']), updateRoom);
router.delete('/:id', ensureRole(['Manager']), deleteRoom);
router.put('/:id/status', ensureRole(['Manager']), updateRoomStatus);

module.exports = router;
