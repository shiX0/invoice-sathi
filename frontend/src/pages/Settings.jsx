import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../services/api";
import { toast } from "react-hot-toast";

function Settings() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Get user from local storage
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: authAPI.getProfile,
    initialData: {
      data: {
        user: getUserFromStorage(),
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (response) => {
      setIsEditing(false);
      // Update local storage with new user data
      localStorage.setItem("user", JSON.stringify(response.data.user));
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      businessInfo: {
        name: formData.get("businessName"),
        address: formData.get("businessAddress"),
        city: formData.get("businessCity"),
        country: formData.get("businessCountry"),
        email: formData.get("businessEmail"),
        phone: formData.get("businessPhone"),
      },
    };

    updateProfileMutation.mutate(data);
  };

  const InputField = ({
    label,
    name,
    type = "text",
    value,
    required = false,
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={value}
        className="input w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required={required}
      />
    </div>
  );

  const DisplayField = ({ label, value }) => (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-1">{label}</h4>
      <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
        {value || "-"}
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = profileData?.data?.user;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isEditing
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Personal Information
          </h3>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  name="firstName"
                  value={user?.firstName}
                  required
                />
                <InputField
                  label="Last Name"
                  name="lastName"
                  value={user?.lastName}
                  required
                />
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={user?.email}
                  required
                />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Business Name"
                    name="businessName"
                    value={user?.businessInfo?.name}
                  />
                  <InputField
                    label="Business Email"
                    name="businessEmail"
                    type="email"
                    value={user?.businessInfo?.email}
                  />
                  <InputField
                    label="Business Phone"
                    name="businessPhone"
                    value={user?.businessInfo?.phone}
                  />
                  <InputField
                    label="Business Address"
                    name="businessAddress"
                    value={user?.businessInfo?.address}
                  />
                  <InputField
                    label="City"
                    name="businessCity"
                    value={user?.businessInfo?.city}
                  />
                  <InputField
                    label="Country"
                    name="businessCountry"
                    value={user?.businessInfo?.country}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateProfileMutation.isPending ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving Changes...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DisplayField label="First Name" value={user?.firstName} />
                <DisplayField label="Last Name" value={user?.lastName} />
                <DisplayField label="Email Address" value={user?.email} />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DisplayField
                    label="Business Name"
                    value={user?.businessInfo?.name}
                  />
                  <DisplayField
                    label="Business Email"
                    value={user?.businessInfo?.email}
                  />
                  <DisplayField
                    label="Business Phone"
                    value={user?.businessInfo?.phone}
                  />
                  <DisplayField
                    label="Business Address"
                    value={user?.businessInfo?.address}
                  />
                  <DisplayField label="City" value={user?.businessInfo?.city} />
                  <DisplayField
                    label="Country"
                    value={user?.businessInfo?.country}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
