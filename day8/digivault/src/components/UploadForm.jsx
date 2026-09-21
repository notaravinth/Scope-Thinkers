import { useState } from "react";
import { supabase } from "../supabase/supabase";
import { auth } from "../firebase/firebase";

function UploadForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    file: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Document name is required.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Document name must be at least 3 characters.";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Document name must be less than 100 characters.";
    }

    if (!formData.type) {
      newErrors.type = "Please select a document type.";
    }

    if (!formData.issuer.trim()) {
      newErrors.issuer = "Issuer is required.";
    } else if (formData.issuer.trim().length < 2) {
      newErrors.issuer = "Issuer must be at least 2 characters.";
    }

    if (!formData.issueDate) {
      newErrors.issueDate = "Issue date is required.";
    } else {
      const today = new Date().toISOString().split("T")[0];

      if (formData.issueDate > today) {
        newErrors.issueDate = "Issue date cannot be in the future.";
      }
    }

    if (formData.expiryDate && formData.issueDate) {
      if (formData.expiryDate < formData.issueDate) {
        newErrors.expiryDate =
          "Expiry date cannot be before the issue date.";
      }
    }

    if (!formData.file) {
      newErrors.file = "Please select a document file.";
    } else {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];

      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "Only PDF, JPG, and PNG files are allowed.";
      }

      if (formData.file.size > 5 * 1024 * 1024) {
        newErrors.file = "File size must be less than 5 MB.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!auth.currentUser) {
      setErrors({
        submit: "You must be logged in to upload a document.",
      });
      return;
    }

    setLoading(true);

    try {
      const userId = auth.currentUser.uid;

      // Create a unique file name
      const fileName = `${Date.now()}-${formData.file.name}`;

      // Store files inside the user's folder
      const filePath = `${userId}/${fileName}`;


      const { error: uploadError } = await supabase.storage
        .from("digivault")
        .upload(filePath, formData.file);

      if (uploadError) {
        throw uploadError;
      }


      const {
        data: { publicUrl },
      } = supabase.storage
        .from("digivault")
        .getPublicUrl(filePath);


      const { error: databaseError } = await supabase
        .from("documents")
        .insert([
          {
            user_id: userId,
            name: formData.name.trim(),
            type: formData.type,
            issuer: formData.issuer.trim(),
            issue_date: formData.issueDate,
            expiry_date: formData.expiryDate || null,
            file_name: formData.file.name,
            file_path: filePath,
            status: "pending",
          },
        ]);

      if (databaseError) {
        throw databaseError;
      }

      console.log("Document uploaded successfully!");
      console.log("File path:", filePath);
      console.log("File URL:", publicUrl);

      alert("Document uploaded successfully!");

      onClose();
    } catch (error) {
      console.error("Upload error:", error);

      setErrors({
        submit:
          error.message ||
          "Something went wrong while uploading the document.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upload Document
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Submit a document for verification.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Document Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Aadhaar Card"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Document Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            >
              <option value="">Select type</option>
              <option value="Identity">Identity</option>
              <option value="Education">Education</option>
              <option value="Government">Government</option>
              <option value="Financial">Financial</option>
              <option value="Other">Other</option>
            </select>

            {errors.type && (
              <p className="mt-1 text-sm text-red-500">
                {errors.type}
              </p>
            )}
          </div>

          {/* Issuer */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Issuer
            </label>

            <input
              type="text"
              name="issuer"
              value={formData.issuer}
              onChange={handleChange}
              placeholder="e.g. UIDAI"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            {errors.issuer && (
              <p className="mt-1 text-sm text-red-500">
                {errors.issuer}
              </p>
            )}
          </div>

          {/* Issue Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Issue Date
            </label>

            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            {errors.issueDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.issueDate}
              </p>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Expiry Date
            </label>

            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.expiryDate}
              </p>
            )}
          </div>

          {/* File */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Document File
            </label>

            <input
              type="file"
              name="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />

            <p className="mt-1 text-xs text-gray-500">
              PDF, JPG, or PNG — maximum 5 MB
            </p>

            {errors.file && (
              <p className="mt-1 text-sm text-red-500">
                {errors.file}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadForm;