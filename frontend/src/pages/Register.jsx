import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      toast.success("Account created successfully! Please login.");
      navigate("/login");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const checkPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "" };

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;

    // Contains number
    if (/\d/.test(password)) strength += 1;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;

    // Contains special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

    const strengthMap = {
      0: { label: "Insecure", color: "bg-red-500", allowed: false },
      1: { label: "Insecure", color: "bg-red-500", allowed: false },
      2: { label: "Low", color: "bg-orange-500", allowed: false },
      3: { label: "Medium", color: "bg-yellow-500", allowed: true },
      4: { label: "Secure", color: "bg-green-500", allowed: true },
      5: { label: "Very Secure", color: "bg-green-600", allowed: true },
    };

    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = "Passwords do not match";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!passwordStrength.allowed) {
      const errorMsg = "Please choose a stronger password";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Send only the required data to API
    const registerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    };

    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold">
          <span className="text-blue-600">Invoice</span> Sathi
        </h1>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First name
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last name
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 space-y-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <p
                      className={`text-xs ${
                        passwordStrength.allowed
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      Password strength: {passwordStrength.label}
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
                      <li
                        className={
                          formData.password.length >= 8 ? "text-green-600" : ""
                        }
                      >
                        At least 8 characters
                      </li>
                      <li
                        className={
                          /\d/.test(formData.password) ? "text-green-600" : ""
                        }
                      >
                        Contains a number
                      </li>
                      <li
                        className={
                          /[a-z]/.test(formData.password)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        Contains a lowercase letter
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(formData.password)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        Contains an uppercase letter
                      </li>
                      <li
                        className={
                          /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        Contains a special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex w-full justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
