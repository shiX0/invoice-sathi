const router = express.Router();

const {
    createInvoice,
    getAllInvoices,
    getInvoice,
    updateInvoice,
    deleteInvoice,
    updatePaymentStatus
} = require('../controllers/invoiceController');

// Protect all routes
router.use(protect);

// Invoice routes
router.post('/', createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoice);
router.patch('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.patch('/:id/payment-status', updatePaymentStatus);

module.exports = router;