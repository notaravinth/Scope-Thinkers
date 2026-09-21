import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { supabase } from "../supabase/supabase";
import { auth } from "../firebase/firebase";

function AdminDashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rejectingDocument, setRejectingDocument] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function fetchPendingDocuments() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("status", "pending")
        .order("uploaded_at", { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching pending documents:", error);
      setError("Unable to load pending documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async function approveDocument(documentId) {
    try {
      setError("");

      const { error } = await supabase
        .from("documents")
        .update({
          status: "approved",
          rejection_reason: null,
        })
        .eq("id", documentId);

      if (error) {
        throw error;
      }

      // Refresh the pending list.
      // The approved document will no longer appear.
      await fetchPendingDocuments();
    } catch (error) {
      console.error("Error approving document:", error);
      setError("Unable to approve the document.");
    }
  }

  async function rejectDocument() {
    if (!rejectionReason.trim()) {
      return;
    }

    try {
      setError("");

      const { error } = await supabase
        .from("documents")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason.trim(),
        })
        .eq("id", rejectingDocument.id);

      if (error) {
        throw error;
      }

      setRejectingDocument(null);
      setRejectionReason("");

      // Refresh the pending list.
      // The rejected document will no longer appear.
      await fetchPendingDocuments();
    } catch (error) {
      console.error("Error rejecting document:", error);
      setError("Unable to reject the document.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              DigiVault Admin
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Review documents waiting for verification.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
          >
            Logout
          </button>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Pending Count */}

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <p className="text-sm text-gray-500">
            Documents Awaiting Review
          </p>

          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {documents.length}
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center">
            <p className="text-gray-500">
              Loading pending documents...
            </p>
          </div>
        ) : (
          <>
            {/* Pending Documents */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {documents.map((document) => (
                <div
                  key={document.id}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >

                  {/* Document Header */}

                  <div className="flex items-start justify-between">

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {document.name}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {document.type}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      Pending
                    </span>

                  </div>

                  {/* Document Information */}

                  <div className="mt-5 space-y-3">

                    <div>
                      <p className="text-sm text-gray-500">
                        Issued By
                      </p>

                      <p className="font-medium text-gray-800">
                        {document.issuer}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Issue Date
                      </p>

                      <p className="font-medium text-gray-800">
                        {document.issue_date}
                      </p>
                    </div>

                    {document.expiry_date && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Expiry Date
                        </p>

                        <p className="font-medium text-gray-800">
                          {document.expiry_date}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-500">
                        File
                      </p>

                      <p className="font-medium text-gray-800 truncate">
                        {document.file_name}
                      </p>
                    </div>

                  </div>

                  {/* View Document */}

                  <div className="mt-5">

                    <a
                      href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/digivault/${document.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                    >
                      View Document
                    </a>

                  </div>

                  {/* Admin Actions */}

                  <div className="flex gap-3 mt-5">

                    <button
                      onClick={() =>
                        approveDocument(document.id)
                      }
                      className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => {
                        setRejectingDocument(document);
                        setRejectionReason("");
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                    >
                      Reject
                    </button>

                  </div>

                </div>
              ))}

            </div>

            {/* Empty State */}

            {documents.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center">

                <p className="text-lg font-medium text-gray-700">
                  No pending documents
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  All submitted documents have been reviewed.
                </p>

              </div>
            )}

          </>
        )}

      </main>

      {/* Reject Modal */}

      {rejectingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">

            <h2 className="text-xl font-bold text-gray-900">
              Reject Document
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Please provide a reason for rejecting{" "}
              <span className="font-medium">
                {rejectingDocument.name}
              </span>
              .
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(e.target.value)
              }
              placeholder="Enter rejection reason..."
              rows="4"
              className="w-full mt-4 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500 resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">

              <button
                onClick={() => {
                  setRejectingDocument(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={rejectDocument}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Document
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminDashboard;