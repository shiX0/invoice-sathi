import { useQuery } from "@tanstack/react-query";
import { invoicesAPI, customersAPI, productsAPI } from "../services/api";

function Dashboard() {
  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: invoicesAPI.getAll,
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: customersAPI.getAll,
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: productsAPI.getAll,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Invoices</h3>
          <p className="text-3xl font-bold text-blue-600">
            {invoicesData?.data?.length || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
          <p className="text-3xl font-bold text-green-600">
            {customersData?.data?.length || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-purple-600">
            {productsData?.data?.length || 0}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
        {/* Add recent invoices table here */}
      </div>
    </div>
  );
}

export default Dashboard;
