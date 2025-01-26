import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoicesAPI, customersAPI, productsAPI } from "../services/api";
import { toast } from "react-hot-toast";
import Modal from "../components/Modal";

// Add status options constant at the top
const STATUS_OPTIONS = ["pending", "paid", "overdue"];

function CreateInvoice() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ product: "", quantity: 1 }]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState("pending");
  const [taxRate, setTaxRate] = useState(13); // Default 13%

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [customersRes, productsRes] = await Promise.all([
        customersAPI.getAll(),
        productsAPI.getAll(),
      ]);

      const customersData = customersRes.data?.data || customersRes.data || [];
      const productsData = productsRes.data?.data || productsRes.data || [];

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);

      console.log("Fetched products:", productsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load form data");
      setCustomers([]);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Customer creation handler
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customerData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
    };

    try {
      const response = await customersAPI.create(customerData);
      setCustomers([...customers, response.data]);
      setSelectedCustomer(response.data._id);
      setIsCustomerModalOpen(false);
      toast.success("Customer created successfully");
    } catch (err) {
      toast.error(err.message || "Failed to create customer");
    }
  };

  // Product creation handler
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      quantity: parseInt(formData.get("quantity")),
      category: formData.get("category"),
      imageUrl: formData.get("imageUrl") || undefined,
    };

    try {
      const response = await productsAPI.create(productData);
      setProducts([...products, response.data]);
      setIsProductModalOpen(false);
      toast.success("Product created successfully");
    } catch (err) {
      toast.error(err.message || "Failed to create product");
    }
  };

  const handleAddItem = () => {
    setItems([...items, { product: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === "product") {
      const selectedProduct = products.find((p) => p._id === value);
      newItems[index] = {
        ...newItems[index],
        product: value,
        quantity: 1,
      };
    } else if (field === "quantity") {
      const product = products.find((p) => p._id === newItems[index].product);
      const newQuantity = parseInt(value) || 1;

      if (newQuantity > (product?.quantity || 0)) {
        toast.error(
          `Warning: Quantity exceeds available stock (${product?.quantity} available)`,
          {
            duration: 2000,
            icon: "⚠️",
          }
        );
      }

      newItems[index] = {
        ...newItems[index],
        quantity: Math.max(1, newQuantity),
      };
    }
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p._id === item.product);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0 || !items[0].product) {
      toast.error("Please add at least one product");
      return;
    }

    try {
      const invoiceData = {
        customer: selectedCustomer,
        products: items
          .map((item) => ({
            product: item.product,
            quantity: parseInt(item.quantity),
          }))
          .filter((item) => item.product && item.quantity),
        dueDate: new Date(dueDate).toISOString(),
        status: status || "pending",
        taxRate: Number(taxRate),
      };

      console.log("Sending invoice data:", invoiceData);
      const response = await invoicesAPI.create(invoiceData);
      toast.success("Invoice created successfully");
      navigate(`/dashboard/invoices/${response.data._id}`);
    } catch (err) {
      console.error("Invoice creation error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to create invoice"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Invoice</h1>
        <button
          onClick={() => navigate("/dashboard/invoices")}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        {/* Customer Selection with Add Customer Button */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add New Customer
            </button>
          </div>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Due Date and Status fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Section with Add Product Button */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Items</h2>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(true)}
                className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                + Add New Product
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                Add Item
              </button>
            </div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6">
                <select
                  value={item.product}
                  onChange={(e) =>
                    handleItemChange(index, "product", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="">Select a product</option>
                  {Array.isArray(products) &&
                    products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ${product.price} (Available:{" "}
                        {product.quantity})
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-span-3">
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    className={`w-full p-2 border rounded-lg ${
                      item.quantity >
                      (products.find((p) => p._id === item.product)?.quantity ||
                        0)
                        ? "border-yellow-400 bg-yellow-50"
                        : ""
                    }`}
                    placeholder="Quantity"
                    required
                  />
                  <span className="absolute right-2 top-2 text-xs text-gray-500">
                    Available:{" "}
                    {products.find((p) => p._id === item.product)?.quantity ||
                      0}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <span className="block p-2 text-gray-600">
                  $
                  {(
                    (products.find((p) => p._id === item.product)?.price || 0) *
                    item.quantity
                  ).toFixed(2)}
                </span>
              </div>
              <div className="col-span-1">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Tax Rate field before totals */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-end space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) =>
                setTaxRate(Math.max(0, Math.min(100, Number(e.target.value))))
              }
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          {/* Totals section */}
          <div className="space-y-2">
            <div className="flex justify-end text-gray-600">
              <span className="w-32">Subtotal:</span>
              <span className="w-32 text-right">
                ${calculateTotals().subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end text-gray-600">
              <span className="w-32">Tax ({taxRate}%):</span>
              <span className="w-32 text-right">
                ${calculateTotals().taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end font-bold text-lg">
              <span className="w-32">Total:</span>
              <span className="w-32 text-right">
                ${calculateTotals().total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Invoice
          </button>
        </div>
      </form>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Add New Customer"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Add New Product"
      >
        <form onSubmit={handleCreateProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                minLength="2"
                maxLength="100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                name="category"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="" disabled selected>
                  Select a category
                </option>
                {["Electronics", "Clothing", "Books", "Food", "Other"].map(
                  (category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows="4"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CreateInvoice;
