import express from 'express';
import ReportsController from './reportController.js';

const router = express.Router();

// Generate a new report
router.post('/generate', ReportsController.generateReport);

// Get report by ID
router.get('/:id', ReportsController.getReportById);

// Get all reports with pagination and filtering
router.get('/', ReportsController.getAllReports);

// Update report
router.put('/:id', ReportsController.updateReport);

// Delete report
router.delete('/:id', ReportsController.deleteReport);

// Export report in different formats
router.get('/:id/export', ReportsController.exportReport);

// Report templates
router.get('/templates/list', ReportsController.getReportTemplates);
router.post('/templates/create', ReportsController.createReportTemplate);

export default router;
