const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const {
    createCustomer,
    getCustomers,
    getCustomer,
    updateCustomer,
    deleteCustomer,
} = require("../controllers/customerController");

// All routes are protected - require authentication
router.use(protect);

// Routes for customer operations
router
    .route("/")
    .post(createCustomer) // Create new customer
    .get(getCustomers); // Get all customers

router
    .route("/:id")
    .get(getCustomer) // Get single customer
    .put(updateCustomer) // Update customer
    .delete(deleteCustomer); // Delete customer

module.exports = router;
