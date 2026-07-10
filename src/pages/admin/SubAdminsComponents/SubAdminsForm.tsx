import React, { FormEvent } from "react";

interface SubAdminsFormProps {
  formData: { name: string; email: string; password: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const SubAdminsForm: React.FC<SubAdminsFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
  error,
  successMessage,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full">
      <h3 className="text-lg font-semibold text-[#101828] mb-5">
        Create New Sub-Admin
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* FULL NAME */}
        <div className="space-y-1">
          <label className="text-sm text-[#4A5565] font-medium">
            Full Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            placeholder="Enter full name"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#615FFF] focus:border-[#615FFF]"
          />
        </div>

        {/* EMAIL */}
        <div className="space-y-1">
          <label className="text-sm text-[#4A5565] font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            required
            placeholder="Enter email"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#615FFF] focus:border-[#615FFF]"
          />
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <label className="text-sm text-[#4A5565] font-medium">
            Password
          </label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={onChange}
            required
            minLength={6}
            placeholder="Enter password"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#615FFF] focus:border-[#615FFF]"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 h-10 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 h-10 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:from-[#514EF0] hover:to-[#9333EA] transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Sub-Admin"}
          </button>
        </div>

        {/* MESSAGES */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}
      </form>
    </div>
  );
};
