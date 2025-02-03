import { useState, useEffect } from "react";
import { invoicesAPI } from "../services/api";
import { toast } from "react-hot-toast";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await invoicesAPI.getAll();
      setInvoices(response.data.data);
    } catch (err) {
      setError(err.message || "Failed to fetch invoices");
      toast.error(err.message || "Failed to fetch invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      customer: formData.get("customer"),
      items: JSON.parse(formData.get("items")),
      totalAmount: parseFloat(formData.get("totalAmount")),
      status: formData.get("status"),
      dueDate: formData.get("dueDate"),
    };

    try {
      if (editingInvoice) {
        const response = await invoicesAPI.update(editingInvoice._id, data);
        toast.success("Invoice updated successfully");
        navigate(`/invoices/${response.data._id}`);
      } else {
        const response = await invoicesAPI.create(data);
        toast.success("Invoice created successfully");
        navigate(`/invoices/${response.data._id}`);
      }
      setIsModalOpen(false);
      setEditingInvoice(null);
    } catch (err) {
      toast.error(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await invoicesAPI.delete(id);
      await fetchInvoices();
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
      toast.success("Invoice deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete invoice");
    }
  };

  const handleInvoiceClick = (invoiceId) => {
    navigate(`/dashboard/invoices/${invoiceId}`);
  };

  function getStatusStyle(status) {
    const styles = {
      paid: "bg-green-100 text-green-800 border border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      overdue: "bg-red-100 text-red-800 border border-red-200",
      draft: "bg-gray-100 text-gray-800 border border-gray-200",
    };
    return styles[status] || styles.pending;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
        <button
          onClick={() => navigate("/dashboard/invoices/create")}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map((invoice) => (
          <div
            key={invoice._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleInvoiceClick(invoice._id)}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    #{invoice.formattedInvoiceNumber || invoice.invoiceNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                    invoice.status
                  )}`}
                >
                  {invoice.status.charAt(0).toUpperCase() +
                    invoice.status.slice(1)}
                </span>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="font-medium text-gray-700">
                    {invoice.customer?.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="truncate">{invoice.customer?.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">
                    {invoice.products?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    ${invoice.subtotal?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tax ({invoice.taxRate}%):
                  </span>
                  <span className="font-medium">
                    ${invoice.taxAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t pt-2 mt-2">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-blue-600">
                    ${invoice.total?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-1 text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Due Date:
                </div>
                <span
                  className={`font-medium ${
                    new Date(invoice.dueDate) < new Date() &&
                    invoice.status !== "paid"
                      ? "text-red-600"
                      : "text-gray-800"
                  }`}
                >
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/invoices/${invoice._id}/edit`);
                  }}
                  className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInvoiceToDelete(invoice);
                    setIsDeleteModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        title={editingInvoice ? "Edit Invoice" : "Create Invoice"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields for invoice - You'll need to implement these based on your needs */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
                setEditingInvoice(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingInvoice ? "Update Invoice" : "Create Invoice"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInvoiceToDelete(null);
        }}
        title="Confirm Delete"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Delete Invoice
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete Invoice #
              {invoiceToDelete?.invoiceNumber}? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(false);
                setInvoiceToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(invoiceToDelete._id);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Invoices;
