import { useState } from "react";
import UploadForm from "../components/UploadForm";
import { supabase } from "../supabase/supabase";

function Dashboard() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Aadhar Card",
      type: "Identity",
      issuer: "UIDAI",
      status: "approved",
    },
    {
      id: 2,
      name: "PAN Card",
      type: "Identity",
      issuer: "Income Tax Department",
      status: "pending",
    },
    {
      id: 3,
      name: "Degree Certificate",
      type: "Education",
      issuer: "SRM University",
      status: "approved",
    },
    {
      id: 4,
      name: "Driving License",
      type: "Government",
      issuer: "Transport Department",
      status: "rejected",
    },
  ]);

  const [filter, setFilter] = useState("All");
  const [showUploadForm, setShowUploadForm] = useState(false);

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

  async function testSupabase() {
    const { data, error } = await supabase.storage
      .from("digivault")
      .list();

    console.log("Supabase data:", data);
    console.log("Supabase error:", error);
  }

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

          <button
            onClick={() => setShowUploadForm(true)}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            + Upload Document
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

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

          <button
            onClick={testSupabase}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
          >
            Test Supabase
          </button>

        </div>

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

            </div>
          ))}

        </div>

        {filteredDocuments.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center">
            <p className="text-gray-500">
              No documents found.
            </p>
          </div>
        )}

      </main>

      {showUploadForm && (
        <UploadForm
          onClose={() => setShowUploadForm(false)}
        />
      )}

    </div>
  );
}

export default Dashboard;