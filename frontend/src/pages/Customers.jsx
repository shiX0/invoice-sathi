import { useState, useEffect } from "react";
import { customersAPI } from "../services/api";
import { toast } from "react-hot-toast";
import Modal from "../components/Modal";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await customersAPI.getAll();
      setCustomers(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch customers");
      toast.error(err.message || "Failed to fetch customers");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
    };

    try {
      if (editingCustomer) {
        const response = await customersAPI.update(editingCustomer._id, data);
        setCustomers(
          customers.map((c) =>
            c._id === editingCustomer._id ? response.data : c
          )
        );
        toast.success("Customer updated successfully");
      } else {
        const response = await customersAPI.create(data);
        setCustomers([...customers, response.data]);
        toast.success("Customer created successfully");
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Operation failed"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await customersAPI.delete(id);
      setCustomers(customers.filter((c) => c._id !== id));
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
      toast.success("Customer deleted successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete customer"
      );
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
        <button
          onClick={() => setIsModalOpen(true)}
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
          Add Customer
        </button>
      </div>

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {customers?.map((customer) => (
            <div
              key={customer._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Customer Header */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-semibold text-blue-600">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Customer ID: #{customer._id.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-sm hover:underline"
                    >
                      {customer.email}
                    </a>
                  </div>

                  <div className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-sm hover:underline"
                    >
                      {customer.phone}
                    </a>
                  </div>

                  <div className="flex items-start space-x-3 text-gray-600">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm">{customer.address}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditingCustomer(customer);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center space-x-1"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setCustomerToDelete(customer);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 flex items-center space-x-1"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && customers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No customers found. Add your first customer!
          </p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={editingCustomer?.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={editingCustomer?.email}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={editingCustomer?.phone}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              defaultValue={editingCustomer?.address}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows="3"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCustomer(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingCustomer ? "Update Customer" : "Create Customer"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
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
              Delete Customer
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete &ldquo;{customerToDelete?.name}
              &rdquo;? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCustomerToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(customerToDelete._id)}
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

export default Customers;
