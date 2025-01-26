import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoicesAPI, customersAPI, productsAPI } from "../services/api";
import { toast } from "react-hot-toast";

const STATUS_OPTIONS = ["pending", "paid", "overdue"];

function EditInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [taxRate, setTaxRate] = useState(13);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [customersRes, productsRes, invoiceRes] = await Promise.all([
        customersAPI.getAll(),
        productsAPI.getAll(),
        invoicesAPI.getOne(id),
      ]);

      const customersData = customersRes.data?.data || customersRes.data || [];
      const productsData = productsRes.data?.data || productsRes.data || [];
      const invoiceData = invoiceRes.data?.data;

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);

      if (invoiceData) {
        setInvoice(invoiceData);
        setSelectedCustomer(invoiceData.customer?._id || "");
        setStatus(invoiceData.status || "pending");
        setDueDate(new Date(invoiceData.dueDate).toISOString().split("T")[0]);
        setTaxRate(invoiceData.taxRate || 13);

        // Transform invoice products to items format
        const invoiceItems =
          invoiceData.products?.map((item) => ({
            product: item.product?._id || "",
            quantity: item.quantity || 1,
          })) || [];

        setItems(
          invoiceItems.length > 0
            ? invoiceItems
            : [{ product: "", quantity: 1 }]
        );
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load invoice data");
      navigate("/dashboard/invoices");
    } finally {
      setIsLoading(false);
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
          { duration: 2000, icon: "⚠️" }
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
        status,
        taxRate: Number(taxRate),
      };

      await invoicesAPI.update(id, invoiceData);
      toast.success("Invoice updated successfully");
      navigate(`/dashboard/invoices/${id}`);
    } catch (err) {
      console.error("Invoice update error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to update invoice"
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
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Invoice #{invoice?.formattedInvoiceNumber}
        </h1>
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
        {/* Customer Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Customer
          </label>
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

        {/* Due Date and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
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

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              Add Item
            </button>
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
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ${product.price} (Available:{" "}
                      {product.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                  required
                />
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

        {/* Tax Rate and Totals */}
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
              className="w-24 px-3 py-2 border rounded-lg"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

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
            Update Invoice
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditInvoice;
