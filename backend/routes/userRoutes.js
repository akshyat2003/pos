import express from 'express';
import * as c from '../controllers/userController.js';
const router = express.Router();
router.get('/', c.getUsers);
router.post('/', c.createUser);
router.put('/:id', c.updateUser);
router.delete('/:id', c.deleteUser);
export default router;
