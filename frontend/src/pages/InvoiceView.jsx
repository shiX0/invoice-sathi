import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoicesAPI } from "../services/api";
import { toast } from "react-hot-toast";
import html2pdf from "html2pdf.js";
import logo from "../assets/react.svg"; // Make sure to add your logo

function InvoiceView() {
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const businessInfo =
    JSON.parse(localStorage.getItem("user"))?.businessInfo || {};

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      const response = await invoicesAPI.getOne(id);
      if (response.data?.data) {
        setInvoice(response.data.data);
      } else {
        throw new Error("Invalid invoice data");
      }
    } catch (err) {
      toast.error(`Failed to fetch invoice: ${err.message}`);
      navigate("/dashboard/invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 1,
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleBackClick = () => {
    navigate("/dashboard/invoices");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!invoice || !invoice.customer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Invoice not found or invalid data</div>
      </div>
    );
  }

  const renderCustomerDetails = () => (
    <div>
      <h2 className="text-gray-500 font-medium mb-2">Bill To</h2>
      <div className="text-gray-800">
        <p className="font-bold">{invoice.customer?.name || "N/A"}</p>
        <p>{invoice.customer?.address || "N/A"}</p>
        <p>{invoice.customer?.email || "N/A"}</p>
        <p>{invoice.customer?.phone || "N/A"}</p>
      </div>
    </div>
  );

  const renderBusinessDetails = () => (
    <div>
      <h2 className="text-gray-500 font-medium mb-2">From</h2>
      <div className="text-gray-800">
        <p className="font-bold">
          {invoice.user?.businessInfo?.name || businessInfo?.name || "N/A"}
        </p>
        <p>
          {invoice.user?.businessInfo?.address ||
            businessInfo?.address ||
            "N/A"}
        </p>
        <p>
          {invoice.user?.businessInfo?.city || businessInfo?.city || "N/A"},{" "}
          {invoice.user?.businessInfo?.country ||
            businessInfo?.country ||
            "N/A"}
        </p>
        <p>
          {invoice.user?.businessInfo?.email || businessInfo?.email || "N/A"}
        </p>
        <p>
          {invoice.user?.businessInfo?.phone || businessInfo?.phone || "N/A"}
        </p>
      </div>
    </div>
  );

  const renderProducts = () => (
    <tbody>
      {invoice.products?.map((item, index) => (
        <tr key={index} className="border-b border-gray-200">
          <td className="py-4">
            <p className="font-medium text-gray-800">
              {item.product?.name || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {item.product?.description || ""}
            </p>
          </td>
          <td className="py-4 text-right">${(item.price || 0).toFixed(2)}</td>
          <td className="py-4 text-right">{item.quantity || 0}</td>
          <td className="py-4 text-right font-medium">
            ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
          </td>
        </tr>
      )) || null}
    </tbody>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-end space-x-4">
          <button
            onClick={handleBackClick}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg hover:bg-gray-50 border border-gray-200 shadow-sm"
          >
            Back to Invoices
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm flex items-center space-x-2"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Download PDF</span>
          </button>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} className="bg-white shadow-lg rounded-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <img src={logo} alt="Company Logo" className="h-12 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-gray-500">#{invoice.formattedInvoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-gray-500">Issue Date</p>
                <p className="font-medium">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Due Date</p>
                <p className="font-medium text-amber-600">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="mb-8">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                invoice.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : invoice.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {invoice.status.toUpperCase()}
            </span>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {renderBusinessDetails()}
            {renderCustomerDetails()}
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left text-gray-600">Item</th>
                <th className="py-3 text-right text-gray-600">Price</th>
                <th className="py-3 text-right text-gray-600">Quantity</th>
                <th className="py-3 text-right text-gray-600">Total</th>
              </tr>
            </thead>
            {renderProducts()}
          </table>

          {/* Summary */}
          <div className="border-t border-gray-200 pt-8">
            <div className="w-full md:w-1/2 ml-auto">
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ${invoice.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
                <span className="font-medium">
                  ${invoice.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">
                  ${invoice.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center text-gray-500">
              <p className="mb-2">Thank you for your business!</p>
              <p className="text-sm">
                Invoice created on{" "}
                {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceView;
