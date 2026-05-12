import { Router } from 'express';
import {
  getQuotes, getQuote, createQuote, updateQuote, deleteQuote, compareQuotes,
} from '../controllers/quote.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getQuotes);
router.get('/:id', getQuote);
router.post('/', createQuote);
router.put('/:id', updateQuote);
router.delete('/:id', deleteQuote);
router.post('/compare', compareQuotes);

export default router;
