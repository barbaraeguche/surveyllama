import { Router } from 'express';
import { submitResponse } from '../controllers/responseController';

const router = Router();

router.post('/:id/responses', submitResponse);

export default router;
