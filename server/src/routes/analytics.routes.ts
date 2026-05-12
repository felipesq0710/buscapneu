import { Router } from 'express';
import {
  getDashboardStats, getPriceByBrand, getCompanyRanking, getPriceDistribution, getInsights,
} from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/price-by-brand', getPriceByBrand);
router.get('/company-ranking', getCompanyRanking);
router.get('/price-distribution', getPriceDistribution);
router.get('/insights', getInsights);

export default router;
