import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import UploadForm from "../components/UploadForm";
import { supabase } from "../supabase/supabase";
import { auth } from "../firebase/firebase";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDocuments() {
    if (!auth.currentUser) {
      setError("You must be logged in to view your documents.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userId = auth.currentUser.uid;

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Unable to load your documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const filteredDocuments =
    filter === "All"
      ? documents
      : documents.filter(
          (document) => document.status === filter
        );

  const approvedCount = documents.filter(
    (document) => document.status === "approved"
  ).length;

  const pendingCount = documents.filter(
    (document) => document.status === "pending"
  ).length;

  const rejectedCount = documents.filter(
    (document) => document.status === "rejected"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              DigiVault
            </h1>

            <p className="text-sm text-gray-500">
              Your digital document vault
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={handleLogout}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
            >
              Logout
            </button>

            <button
              onClick={() => setShowUploadForm(true)}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              + Upload Document
            </button>

          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Statistics */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Approved Documents
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {approvedCount}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Documents
            </p>

            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {pendingCount}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Rejected Documents
            </p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {rejectedCount}
            </p>
          </div>

        </div>

        {/* Filters */}

        <div className="flex flex-wrap items-center gap-3 mb-6">

          {["All", "approved", "pending", "rejected"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                {status === "All"
                  ? "All"
                  : status.charAt(0).toUpperCase() +
                    status.slice(1)}
              </button>
            )
          )}

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
              Loading your documents...
            </p>
          </div>
        ) : (

          <>

            {/* Documents */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >

                  <div className="flex items-start justify-between">

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {document.name}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {document.type}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        document.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : document.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {document.status}
                    </span>

                  </div>

                  <div className="mt-5">

                    <p className="text-sm text-gray-500">
                      Issued by
                    </p>

                    <p className="font-medium text-gray-800 mt-1">
                      {document.issuer}
                    </p>

                  </div>

                  <div className="mt-4">

                    <p className="text-sm text-gray-500">
                      Issue Date
                    </p>

                    <p className="font-medium text-gray-800 mt-1">
                      {document.issue_date}
                    </p>

                  </div>

                  {document.expiry_date && (
                    <div className="mt-4">

                      <p className="text-sm text-gray-500">
                        Expiry Date
                      </p>

                      <p className="font-medium text-gray-800 mt-1">
                        {document.expiry_date}
                      </p>

                    </div>
                  )}

                  {document.status === "rejected" &&
                    document.rejection_reason && (
                      <div className="mt-4 rounded-lg bg-red-50 p-3">

                        <p className="text-sm font-medium text-red-700">
                          Rejection Reason
                        </p>

                        <p className="text-sm text-red-600 mt-1">
                          {document.rejection_reason}
                        </p>

                      </div>
                    )}

                </div>
              ))}

            </div>

            {/* Empty State */}

            {filteredDocuments.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center">

                <p className="text-gray-500">
                  No documents found.
                </p>

                {filter === "All" && (
                  <p className="text-sm text-gray-400 mt-2">
                    Upload your first document to get started.
                  </p>
                )}

              </div>
            )}

          </>

        )}

      </main>

      {/* Upload Form */}

      {showUploadForm && (
        <UploadForm
          onClose={() => {
            setShowUploadForm(false);
            fetchDocuments();
          }}
        />
      )}

    </div>
  );
}

export default Dashboard;