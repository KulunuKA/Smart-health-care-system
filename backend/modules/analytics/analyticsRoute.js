import express from 'express';
import AnalyticsController from './analyticsController.js';

const router = express.Router();

// Generate comprehensive analytics
router.post('/generate', AnalyticsController.generateAnalytics);

// Get analytics by ID
router.get('/:id', AnalyticsController.getAnalyticsById);

// Get all analytics with pagination and filtering
router.get('/', AnalyticsController.getAllAnalytics);

// Get dashboard summary (quick overview)
router.get('/dashboard/summary', AnalyticsController.getDashboardSummary);

// Delete analytics
router.delete('/:id', AnalyticsController.deleteAnalytics);

export default router;
