import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import {
  deleteObject,
  getBlob,
  getMetadata,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { auth, storage } from "./firebase";
import { useAuth } from "./AuthContext.jsx";
import AuthScreen from "./AuthScreen.jsx";
import "./App.css";

const API_URL = "http://localhost:5000";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function Icon({ name, size = 18, className = "" }) {
  const common = {
    width: size,

    height: size,

    viewBox: "0 0 24 24",

    fill: "none",

    stroke: "currentColor",

    strokeWidth: 1.8,

    strokeLinecap: "round",

    strokeLinejoin: "round",

    "aria-hidden": true,

    className,
  };

  const paths = {
    arrow: (
      <>
        <path d="M5 12h14" />

        <path d="m12 5 7 7-7 7" />
      </>
    ),

    upload: (
      <>
        <path d="M12 16V4" />

        <path d="m7 9 5-5 5 5" />

        <path d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" />
      </>
    ),

    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />

        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),

    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />

        <path d="m16 16 4 4" />
      </>
    ),

    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

        <circle cx="12" cy="10" r="2.5" />
      </>
    ),

    external: (
      <>
        <path d="M14 3h7v7M10 14 21 3M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
      </>
    ),

    close: (
      <>
        <path d="m18 6-12 12M6 6l12 12" />
      </>
    ),

    check: <path d="m5 12 4 4L19 6" />,

    filter: <path d="M4 7h16M7 12h10m-7 5h4" />,

    moon: <path d="M20.8 13A8.5 8.5 0 0 1 11 3.2 8.5 8.5 0 1 0 20.8 13Z" />,

    sun: (
      <>
        <circle cx="12" cy="12" r="4" />

        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </>
    ),

    spark: (
      <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" />
    ),
  };

  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

function getInitials(company = "?") {
  return company

    .split(/\s+/)

    .filter(Boolean)

    .slice(0, 2)

    .map((word) => word[0])

    .join("")

    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "Recently listed";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently listed";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",

    day: "numeric",
  }).format(date);
}

const inputClass =
  "min-w-0 rounded-xl border border-[#dce2d4] bg-white px-3 py-2.5 text-sm text-[#25372b] outline-none transition placeholder:text-[#8b9588] focus:border-[#537a4b] focus:ring-4 focus:ring-[#537a4b]/10 dark:border-[#3a493d] dark:bg-[#1d261f] dark:text-[#edf2e8] dark:placeholder:text-[#859184]";

const mutedClass = "text-[#737d70] dark:text-[#a8b3a5]";

export default function App() {
  const { user, loading: authLoading } = useAuth();

  const [resumeText, setResumeText] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);

  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [uploadInfo, setUploadInfo] = useState(null);

  const [savedDocuments, setSavedDocuments] = useState([]);

  const [documentsOwnerUid, setDocumentsOwnerUid] = useState(null);

  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [savingDocument, setSavingDocument] = useState(false);

  const [documentMessage, setDocumentMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("match");

  const [workType, setWorkType] = useState("all");

  const [showResumePanel, setShowResumePanel] = useState(true);

  const [dragging, setDragging] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("matchwise-theme") === "dark";
    } catch {
      return false;
    }
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;

    async function loadSavedDocuments() {
      setDocumentsLoading(true);
      setDocumentMessage("");

      try {
        const documentsRef = ref(storage, `users/${user.uid}/resumes`);
        const result = await listAll(documentsRef);
        const documents = await Promise.all(
          result.items.map(async (itemRef) => {
            const metadata = await getMetadata(itemRef);
            return {
              name: metadata.customMetadata?.originalName || metadata.name,
              fullPath: itemRef.fullPath,
              size: metadata.size,
              contentType: metadata.contentType || "application/octet-stream",
              updatedAt: metadata.updated,
              storageRef: itemRef,
            };
          }),
        );

        documents.sort(
          (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
        );

        if (!cancelled) {
          setSavedDocuments(documents);
          setDocumentsOwnerUid(user.uid);
        }
      } catch (err) {
        if (!cancelled) {
          setDocumentMessage(
            err.code === "storage/unauthorized"
              ? "Firebase Storage access was denied. Check your Storage rules."
              : "Could not load your saved resumes. Check Firebase Storage setup.",
          );
        }
      } finally {
        if (!cancelled) setDocumentsLoading(false);
      }
    }

    loadSavedDocuments();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  async function saveSelectedDocument() {
    if (!user?.uid || !selectedFile) {
      setError("Choose a resume file before saving.");
      return;
    }

    setSavingDocument(true);
    setError("");
    setDocumentMessage("");

    try {
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `users/${user.uid}/resumes/${Date.now()}-${safeName}`;
      const documentRef = ref(storage, storagePath);

      await uploadBytes(documentRef, selectedFile, {
        contentType: selectedFile.type || "application/octet-stream",
        customMetadata: {
          originalName: selectedFile.name,
        },
      });

      const metadata = await getMetadata(documentRef);
      setDocumentsOwnerUid(user.uid);
      setSavedDocuments((current) => [
        {
          name: metadata.customMetadata?.originalName || selectedFile.name,
          fullPath: documentRef.fullPath,
          size: metadata.size,
          contentType: metadata.contentType || selectedFile.type,
          updatedAt: metadata.updated,
          storageRef: documentRef,
        },
        ...current,
      ]);
      setDocumentMessage(`Saved “${selectedFile.name}” to your private documents.`);
    } catch (err) {
      setError(
        err.code === "storage/unauthorized"
          ? "Firebase Storage denied the upload. Check your Storage rules."
          : "Could not save the resume to Firebase Storage. Check your Storage setup and try again.",
      );
    } finally {
      setSavingDocument(false);
    }
  }

  async function viewSavedDocument(document) {
    // Open a tab immediately so browsers do not block it while the secure download runs.
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.title = document.name;
      previewWindow.document.body.textContent = "Loading document…";
    }

    try {
      const blob = await getBlob(document.storageRef);
      const objectUrl = URL.createObjectURL(blob);

      if (previewWindow) {
        previewWindow.location.href = objectUrl;
      } else {
        const link = window.document.createElement("a");
        link.href = objectUrl;
        link.download = document.name;
        link.click();
      }

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (err) {
      if (previewWindow) previewWindow.close();
      setDocumentMessage(
        err.code === "storage/unauthorized"
          ? "You do not have permission to open this document."
          : "Could not open this document. Please try again.",
      );
    }
  }

  async function deleteSavedDocument(document) {
    const confirmed = window.confirm(`Delete “${document.name}” from your saved documents?`);
    if (!confirmed) return;

    try {
      await deleteObject(document.storageRef);
      setSavedDocuments((current) =>
        current.filter((item) => item.fullPath !== document.fullPath),
      );
      setDocumentMessage(`Deleted “${document.name}”.`);
    } catch {
      setDocumentMessage("Could not delete this document. Please try again.");
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(
        "matchwise-theme",

        darkMode ? "dark" : "light",
      );
    } catch {
      // Continue even when browser storage is unavailable.
    }
  }, [darkMode]);

  function chooseFile(file) {
    setError("");

    setMatches([]);

    setUploadInfo(null);

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setError("Choose a PDF or DOCX file to continue.");

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("This file is over 5 MB. Please choose a smaller resume.");

      return;
    }

    setSelectedFile(file);

    setResumeText("");
  }

  async function findMatches() {
    if (!selectedFile && resumeText.trim().length < 30) {
      setError("Upload a resume or paste at least 30 characters of text.");

      return;
    }

    setLoading(true);

    setError("");

    setMatches([]);

    setUploadInfo(null);

    try {
      let response;

      if (selectedFile) {
        const formData = new FormData();

        formData.append("resume", selectedFile);

        response = await fetch(
          `${API_URL}/api/resumes/upload-match`,

          {
            method: "POST",

            body: formData,
          },
        );
      } else {
        response = await fetch(`${API_URL}/api/resumes/match`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ resumeText }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to find matches.");
      }

      setMatches(data.matches || []);

      if (selectedFile) {
        setUploadInfo({
          fileName: data.fileName || selectedFile.name,

          characters: data.extractedCharacters || 0,
        });
      }

      setShowResumePanel(false);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Is it running on port 5000?",
      );
    } finally {
      setLoading(false);
    }
  }

  function removeFile() {
    setSelectedFile(null);

    setUploadInfo(null);

    setMatches([]);

    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const visibleSavedDocuments = documentsOwnerUid === user?.uid ? savedDocuments : [];

  const filteredMatches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = matches.filter((job) => {
      const searchable = [
        job.title,

        job.company,

        job.description,

        job.location,

        ...(job.skills || []),
      ]

        .filter(Boolean)

        .join(" ")

        .toLowerCase();

      const type = (job.employmentType || "").toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (workType === "all" || type.includes(workType))
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.pubDate || 0) - new Date(a.pubDate || 0);
      }

      if (sortBy === "company") {
        return (a.company || "").localeCompare(b.company || "");
      }

      return (b.similarity ?? -1) - (a.similarity ?? -1);
    });
  }, [matches, searchTerm, sortBy, workType]);

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f7f0] text-[#25372b] dark:bg-[#141a15] dark:text-[#edf2e8]">
        <p className="text-sm font-semibold">Loading Matchwise...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <main
      className={`${
        darkMode ? "dark" : ""
      } min-h-screen bg-[#f7f7f0] text-[#25372b] transition-colors duration-300 dark:bg-[#141a15] dark:text-[#edf2e8]`}
    >
      <nav className="sticky top-0 z-20 border-b border-[#e2e5d9]/90 bg-[#f7f7f0]/95 backdrop-blur-xl dark:border-[#303b31] dark:bg-[#141a15]/95">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a
            className="flex items-center gap-2.5"
            href="#top"
            aria-label="Matchwise home"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#254b35] text-lg font-black text-[#d9f36a] dark:bg-[#d9f36a] dark:text-[#203b2a]">
              m.
            </span>

            <span className="text-xl font-black tracking-[-0.06em]">
              matchwise<span className="text-[#8eb66e]">.</span>
            </span>
          </a>

          <div className="hidden items-center gap-2 text-xs font-medium text-[#737d70] md:flex dark:text-[#a8b3a5]">
            <span className="h-2 w-2 rounded-full bg-[#8db66c] ring-4 ring-[#8db66c]/15" />
            Your next move starts here
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dce2d4] px-3 text-xs font-bold transition hover:bg-[#edf0e6] dark:border-[#435043] dark:hover:bg-[#263329]"
            >
              <Icon name={darkMode ? "sun" : "moon"} size={16} />

              <span className="hidden sm:inline">
                {darkMode ? "Light mode" : "Dark mode"}
              </span>
            </button>

            <span
              className="hidden max-w-40 truncate text-xs font-semibold sm:block"
              title={user.email || "Signed in"}
            >
              {user.email || "Signed in"}
            </span>

            <button
              type="button"
              onClick={async () => {
                try {
                  await signOut(auth);

                  setError("");
                } catch {
                  setError("Unable to sign out. Please try again.");
                }
              }}
              className="rounded-full border border-[#dce2d4] px-3 py-2.5 text-xs font-bold transition hover:bg-[#edf0e6] dark:border-[#435043] dark:hover:bg-[#263329]"
            >
              Sign out
            </button>

            <a
              href="#opportunities"
              className="inline-flex items-center gap-2 rounded-full bg-[#254b35] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#183b27] dark:bg-[#d9f36a] dark:text-[#203b2a] dark:hover:bg-[#c9e85a]"
            >
              Explore roles <Icon name="arrow" size={14} />
            </a>
          </div>
        </div>
      </nav>

      <section
        id="top"
        className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-12 sm:px-8 md:grid-cols-[1.1fr_.9fr] md:pb-16 md:pt-16 lg:px-12"
      >
        <div>
          <p className="mb-5 flex items-center gap-3 text-[10px] font-extrabold tracking-[.24em] text-[#668552] dark:text-[#b5d39a]">
            <span className="h-px w-8 bg-current" />
            THE JOB SEARCH, RECONSIDERED
          </p>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.065em] sm:text-6xl lg:text-7xl">
            Your next chapter
            <br />
            looks{" "}
            <span className="font-serif italic text-[#789d5d] dark:text-[#c0df9f]">
              closer.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-[#737d70] sm:text-base dark:text-[#a8b3a5]">
            Less scrolling. Better-fit opportunities. Bring your experience and
            we’ll find the roles worth your attention.
          </p>

          <div className="mt-7 flex items-center gap-3 text-xs font-semibold text-[#586a55] dark:text-[#c1cdbb]">
            <div className="flex -space-x-2">
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#f7f7f0] bg-[#dfe8d2] text-[10px] text-[#38543a] dark:border-[#141a15]">
                A
              </span>

              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#f7f7f0] bg-[#e9d8c6] text-[10px] text-[#76543a] dark:border-[#141a15]">
                J
              </span>

              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#f7f7f0] bg-[#d8e5df] text-[10px] text-[#385b4b] dark:border-[#141a15]">
                M
              </span>
            </div>
            Thoughtful matches, not keyword bingo.
          </div>
        </div>

        <div className="relative mx-auto hidden h-[310px] w-full max-w-[470px] items-center justify-center md:flex">
          <div className="absolute h-[280px] w-[280px] rounded-full border border-[#d9dfce] dark:border-[#39483a]" />

          <div className="absolute h-[215px] w-[215px] rounded-full border border-dashed border-[#c7d1b9] dark:border-[#465543]" />

          <div className="absolute right-12 top-7 h-4 w-4 rounded-full bg-[#d9f36a] shadow-[0_0_0_8px_rgba(217,243,106,.18)]" />

          <div className="absolute left-6 top-14 h-24 w-28 -rotate-12 rounded-2xl border border-[#dce2d4] bg-[#e8ecdf] p-4 shadow-sm dark:border-[#435043] dark:bg-[#263329]">
            <span className="mb-4 block h-2 w-2 rounded-full bg-[#8eb66e]" />

            <span className="mb-2 block h-1.5 w-14 rounded bg-[#b7c4a9]" />

            <span className="mb-2 block h-1.5 w-10 rounded bg-[#c9d2bf]" />

            <span className="block h-1.5 w-12 rounded bg-[#c9d2bf]" />
          </div>

          <div className="relative z-10 w-64 -rotate-3 rounded-2xl border border-[#e0e4d8] bg-white p-5 shadow-[0_24px_70px_rgba(42,62,40,.13)] dark:border-[#3b493c] dark:bg-[#202a21]">
            <div className="flex items-center justify-between text-[9px] font-extrabold tracking-[.18em] text-[#718269]">
              <span>YOUR NEXT ROLE</span>

              <span className="text-lg text-[#8eb66e]">✳</span>
            </div>

            <p className="mt-7 text-3xl font-semibold leading-none tracking-[-.06em]">
              Good work.
              <br />
              <span className="font-serif italic text-[#789d5d] dark:text-[#c0df9f]">
                Good fit.
              </span>
            </p>

            <div className="mt-8 flex items-center justify-between border-t border-[#e5e9df] pt-3 text-[9px] font-bold tracking-widest text-[#778271] dark:border-[#3a493d]">
              <span>01 — 50</span>

              <span className="text-lg">↗</span>
            </div>
          </div>

          <div className="absolute bottom-7 right-3 rotate-6 rounded-lg bg-[#d9f36a] px-4 py-3 text-[10px] font-black leading-tight tracking-widest text-[#203b2a] shadow-lg">
            MAKE
            <br />
            YOUR
            <br />
            MOVE ↗
          </div>
        </div>
      </section>

      <section
        id="opportunities"
        className="border-t border-[#e1e5d9] bg-[#f0f1e8] dark:border-[#303b31] dark:bg-[#192119]"
      >
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[10px] font-extrabold tracking-[.23em] text-[#668552] dark:text-[#b5d39a]">
                THE SHORTLIST
              </p>

              <h2 className="text-3xl font-semibold tracking-[-.05em] sm:text-4xl">
                Find your kind of work.
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#737d70] dark:text-[#a8b3a5]">
              <span className="h-2 w-2 rounded-full bg-[#8db66c]" />

              {matches.length
                ? `${matches.length} roles matched`
                : "Up to 50 real listings"}
            </div>
          </div>

          {showResumePanel && (
            <section className="rounded-2xl border border-[#dce2d4] bg-[#fbfcf7] p-5 shadow-[0_8px_30px_rgba(34,54,34,.04)] sm:p-7 dark:border-[#354337] dark:bg-[#202a21]">
              <div className="mb-6 flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e5ecd9] text-xs font-black text-[#31543a] dark:bg-[#354a34] dark:text-[#d9f36a]">
                  01
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold tracking-tight">
                    Start with your experience
                  </h3>

                  <p className={`mt-1 text-sm ${mutedClass}`}>
                    One resume. A clearer direction.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResumePanel(false)}
                  aria-label="Collapse resume panel"
                  className="grid h-9 w-9 place-items-center rounded-full text-[#7c8677] transition hover:bg-[#edf0e6] dark:hover:bg-[#2b382d]"
                >
                  <Icon name="close" />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:gap-6">
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => {
                      event.preventDefault();

                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();

                      setDragging(false);

                      chooseFile(event.dataTransfer.files?.[0]);
                    }}
                    className={`flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center transition ${
                      dragging
                        ? "border-[#62874f] bg-[#eaf0df] dark:bg-[#2b382b]"
                        : "border-[#cbd5c0] bg-[#f6f8f1] hover:border-[#789d5d] hover:bg-[#f0f4e8] dark:border-[#52644f] dark:bg-[#1a221b] dark:hover:bg-[#253126]"
                    } ${selectedFile ? "border-solid border-[#8eae73]" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => chooseFile(event.target.files?.[0])}
                    />

                    <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#e5ecd9] text-[#31543a] dark:bg-[#354a34] dark:text-[#d9f36a]">
                      <Icon
                        name={selectedFile ? "check" : "upload"}
                        size={21}
                      />
                    </span>

                    <strong className="max-w-full break-words text-sm">
                      {selectedFile
                        ? selectedFile.name
                        : "Drop your resume here"}
                    </strong>

                    <span className={`mt-1 text-xs ${mutedClass}`}>
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB · Ready to scan`
                        : "PDF or DOCX · up to 5 MB"}
                    </span>

                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#476b3e] dark:text-[#c2dfa5]">
                      {selectedFile ? "Choose another file" : "Browse files"}

                      <Icon name="arrow" size={14} />
                    </span>
                  </button>

                  {selectedFile && (
                    <button
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#8a5144] hover:underline dark:text-[#f0a899]"
                      type="button"
                      onClick={removeFile}
                    >
                      Remove file <Icon name="close" size={12} />
                    </button>
                  )}
                </div>

                <div className="hidden items-center justify-center text-[10px] font-bold tracking-widest text-[#9aa391] md:flex">
                  OR
                </div>

                <div className="flex min-w-0 flex-col">
                  <label
                    htmlFor="resume-text"
                    className="mb-2 text-xs font-bold"
                  >
                    Paste your resume
                  </label>

                  <textarea
                    id="resume-text"
                    value={resumeText}
                    disabled={Boolean(selectedFile) || loading}
                    onChange={(event) => {
                      setResumeText(event.target.value);

                      setError("");
                    }}
                    placeholder="Experience, skills, projects, the things you’ve built…"
                    rows={5}
                    className={`${inputClass} min-h-36 flex-1 resize-y leading-6 disabled:cursor-not-allowed disabled:opacity-50`}
                  />

                  <div
                    className={`mt-2 flex items-center justify-between text-[11px] ${mutedClass}`}
                  >
                    <span>{resumeText.length.toLocaleString()} characters</span>

                    {selectedFile && (
                      <button
                        type="button"
                        className="font-bold text-[#476b3e] dark:text-[#c2dfa5]"
                        onClick={() => {
                          removeFile();

                          setResumeText("");
                        }}
                      >
                        Switch to text
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <section className="mt-6 border-t border-[#e2e6db] pt-5 dark:border-[#354337]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold">Your saved documents</h4>
                    <p className={`mt-1 text-xs ${mutedClass}`}>
                      Private to your account. Only you can access these files.
                    </p>
                  </div>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={saveSelectedDocument}
                      disabled={savingDocument}
                      className="rounded-full border border-[#bdcbb2] px-4 py-2 text-xs font-bold text-[#476b3e] transition hover:bg-[#eaf0df] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#586b4d] dark:text-[#c2dfa5] dark:hover:bg-[#2c392b]"
                    >
                      {savingDocument ? "Saving…" : "Save selected resume"}
                    </button>
                  )}
                </div>

                {documentMessage && (
                  <p role="status" className="mt-3 rounded-xl border border-[#dce2d4] bg-white px-3 py-2 text-xs text-[#476b3e] dark:border-[#354337] dark:bg-[#1d261f] dark:text-[#c2dfa5]">
                    {documentMessage}
                  </p>
                )}

                {documentsLoading ? (
                  <p className={`mt-4 text-xs ${mutedClass}`}>Loading your documents…</p>
                ) : visibleSavedDocuments.length === 0 ? (
                  <p className={`mt-4 text-xs ${mutedClass}`}>
                    No saved resumes yet. Choose a PDF or DOCX file, then select “Save selected resume”.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-[#e2e6db] dark:divide-[#354337]">
                    {visibleSavedDocuments.map((document) => (
                      <li key={document.fullPath} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e5ecd9] text-[#31543a] dark:bg-[#354a34] dark:text-[#d9f36a]">
                            <Icon name="file" size={17} />
                          </span>
                          <div className="min-w-0">
                            <p className="break-all text-xs font-semibold">{document.name}</p>
                            <p className={`mt-1 text-[10px] ${mutedClass}`}>
                              {(document.size / 1024).toFixed(1)} KB · {formatDate(document.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <button
                            type="button"
                            onClick={() => viewSavedDocument(document)}
                            className="text-xs font-bold text-[#476b3e] hover:underline dark:text-[#c2dfa5]"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSavedDocument(document)}
                            className="text-xs font-semibold text-[#8a5144] hover:underline dark:text-[#f0a899]"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-[#ecc7bd] bg-[#fff0eb] px-4 py-3 text-sm text-[#934e3f] dark:border-[#694039] dark:bg-[#3a2521] dark:text-[#ffc2b3]"
                >
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 border-t border-[#e2e6db] pt-5 sm:flex-row sm:items-center dark:border-[#354337]">
                <p className={`flex items-center gap-2 text-xs ${mutedClass}`}>
                  <Icon name="file" size={15} />
                  Save a copy to your private Firebase documents.
                </p>

                <button
                  type="button"
                  onClick={findMatches}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#254b35] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#183b27] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-[#d9f36a] dark:text-[#203b2a] dark:hover:bg-[#c9e85a]"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-[#203b2a]/30 dark:border-t-[#203b2a]" />
                      Finding your fit…
                    </>
                  ) : (
                    <>
                      Find my matches <Icon name="arrow" size={17} />
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {!showResumePanel && (
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#dce2d4] bg-[#fbfcf7] p-4 sm:flex-row sm:items-center dark:border-[#354337] dark:bg-[#202a21]">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e5ecd9] text-[#31543a] dark:bg-[#354a34] dark:text-[#d9f36a]">
                  <Icon name="check" size={16} />
                </span>

                <div>
                  <strong className="block text-sm">
                    {selectedFile?.name ||
                      (resumeText
                        ? "Resume text added"
                        : uploadInfo?.fileName || "Resume analyzed")}
                  </strong>

                  <span className={`mt-1 block text-xs ${mutedClass}`}>
                    Your experience has been used to find relevant roles.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="text-sm font-bold text-[#476b3e] dark:text-[#c2dfa5]"
                onClick={() => setShowResumePanel(true)}
              >
                Update resume <Icon name="arrow" size={14} className="inline" />
              </button>
            </div>
          )}

          {uploadInfo && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#b9d0a9] bg-[#eaf2e4] px-4 py-3 text-sm text-[#31543a] dark:border-[#3e5940] dark:bg-[#263728] dark:text-[#cce2bc]">
              <Icon name="check" size={17} />

              <span>
                <strong>Resume processed.</strong>{" "}
                {uploadInfo.characters.toLocaleString()} characters extracted
                from {uploadInfo.fileName}.
              </span>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-5 border-b border-[#d9dfd0] pb-5 lg:flex-row lg:items-end lg:justify-between dark:border-[#354337]">
            <div>
              <p className="mb-2 text-[10px] font-extrabold tracking-[.2em] text-[#668552] dark:text-[#b5d39a]">
                02 / YOUR RESULTS
              </p>

              <h3 className="text-2xl font-semibold tracking-[-.04em] sm:text-3xl">
                {matches.length
                  ? "Roles with potential."
                  : "Opportunities, on your terms."}
              </h3>

              <p className={`mt-2 text-sm ${mutedClass}`}>
                {matches.length
                  ? `Showing ${filteredMatches.length} of ${matches.length} matching roles.`
                  : "Upload your resume to rank these roles by how well they fit your experience."}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(190px,1fr)_150px_150px] lg:w-[570px]">
              <label className="flex items-center gap-2 rounded-xl border border-[#dce2d4] bg-white px-3 dark:border-[#3a493d] dark:bg-[#1d261f]">
                <Icon
                  name="search"
                  size={16}
                  className="shrink-0 text-[#7d8977]"
                />

                <input
                  aria-label="Search results"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search roles, skills…"
                  className="min-w-0 w-full bg-transparent py-2 text-sm outline-none placeholder:text-[#8b9588] dark:placeholder:text-[#859184]"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[#dce2d4] bg-white px-3 dark:border-[#3a493d] dark:bg-[#1d261f]">
                <Icon
                  name="filter"
                  size={15}
                  className="shrink-0 text-[#7d8977]"
                />

                <select
                  aria-label="Filter employment type"
                  value={workType}
                  onChange={(event) => setWorkType(event.target.value)}
                  className="min-w-0 w-full bg-transparent py-2 text-xs outline-none dark:bg-[#1d261f]"
                >
                  <option value="all">All types</option>

                  <option value="full-time">Full-time</option>

                  <option value="part-time">Part-time</option>

                  <option value="contract">Contract</option>

                  <option value="internship">Internship</option>
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[#dce2d4] bg-white px-3 dark:border-[#3a493d] dark:bg-[#1d261f]">
                <span className="text-[10px] font-bold text-[#7d8977]">
                  SORT
                </span>

                <select
                  aria-label="Sort results"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="min-w-0 w-full bg-transparent py-2 text-xs outline-none dark:bg-[#1d261f]"
                >
                  <option value="match">Best match</option>

                  <option value="newest">Newest</option>

                  <option value="company">Company A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#dce2d4] bg-[#fbfcf7] p-10 dark:border-[#354337] dark:bg-[#202a21]">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#dce5cf] border-t-[#476b3e] dark:border-[#435043] dark:border-t-[#d9f36a]" />

              <div>
                <strong className="text-sm">Reading between the lines.</strong>

                <p className={`mt-1 text-xs ${mutedClass}`}>
                  Comparing your experience with the roles in our shortlist.
                </p>
              </div>
            </div>
          )}

          {!loading && matches.length === 0 && (
            <div className="mt-5 grid gap-5 rounded-2xl border border-dashed border-[#ccd5c2] bg-[#fbfcf7] p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-8 dark:border-[#435043] dark:bg-[#202a21]">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e7eddd] text-3xl text-[#476b3e] dark:bg-[#2c382c] dark:text-[#d9f36a]">
                <Icon name="file" size={28} />
              </div>

              <div>
                <h4 className="font-bold">
                  Your next opportunity is in here somewhere.
                </h4>

                <p className={`mt-2 max-w-xl text-sm leading-6 ${mutedClass}`}>
                  Upload a resume above and we’ll compare it with the current
                  Jobicy listings. Your best-fit roles will show up here.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowResumePanel(true);

                  document

                    .getElementById("opportunities")

                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#bdcbb2] px-4 py-2.5 text-xs font-bold text-[#476b3e] transition hover:bg-[#eaf0df] dark:border-[#586b4d] dark:text-[#c2dfa5] dark:hover:bg-[#2c392b]"
              >
                Add your resume <Icon name="arrow" size={15} />
              </button>
            </div>
          )}

          {!loading && matches.length > 0 && filteredMatches.length === 0 && (
            <div className="mt-5 rounded-2xl border border-[#dce2d4] bg-[#fbfcf7] p-10 text-center dark:border-[#354337] dark:bg-[#202a21]">
              <Icon
                name="search"
                size={25}
                className="mx-auto text-[#789d5d]"
              />

              <h4 className="mt-3 font-bold">
                No roles found for that search.
              </h4>

              <p className={`mt-2 text-sm ${mutedClass}`}>
                Try another keyword or clear the employment-type filter.
              </p>

              <button
                className="mt-3 text-sm font-bold text-[#476b3e] dark:text-[#c2dfa5]"
                onClick={() => {
                  setSearchTerm("");

                  setWorkType("all");
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {!loading && filteredMatches.length > 0 && (
            <div className="mt-3 divide-y divide-[#dce2d4] border-y border-[#dce2d4] dark:divide-[#354337] dark:border-[#354337]">
              {filteredMatches.map((job, index) => (
                <article
                  key={`${job.sourceId || "job"}-${job.company}-${job.title}-${index}`}
                  className="group grid gap-4 py-6 transition-colors sm:grid-cols-[48px_minmax(0,1fr)_130px] sm:gap-5 lg:grid-cols-[54px_minmax(0,1fr)_150px]"
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl text-xs font-black tracking-wide ${
                      [
                        "bg-[#e4ebd9] text-[#35543a]",

                        "bg-[#f0e2d4] text-[#80593a]",

                        "bg-[#dce9e3] text-[#3d6754]",

                        "bg-[#e6dff0] text-[#644b7e]",

                        "bg-[#eee8cf] text-[#75632d]",
                      ][index % 5]
                    } dark:bg-[#303e30] dark:text-[#d3e4c7]`}
                  >
                    {getInitials(job.company)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs font-bold text-[#527246] dark:text-[#c2dfa5]">
                        {job.company || "Company not specified"}
                      </span>

                      <span className={`text-[10px] ${mutedClass}`}>
                        {formatDate(job.pubDate)}
                      </span>
                    </div>

                    <h4 className="mt-1 text-lg font-semibold tracking-[-.025em] transition-colors group-hover:text-[#527246] dark:group-hover:text-[#d9f36a]">
                      {job.title || "Untitled role"}
                    </h4>

                    <div
                      className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${mutedClass}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Icon name="pin" size={13} />

                        {job.location || "Location not specified"}
                      </span>

                      {job.employmentType && <span>{job.employmentType}</span>}

                      {job.experienceLevel && (
                        <span>{job.experienceLevel}</span>
                      )}
                    </div>

                    <p
                      className={`mt-3 max-w-4xl text-xs leading-6 ${mutedClass}`}
                    >
                      {(job.description || "No description provided.")

                        .replace(/\s+/g, " ")

                        .slice(0, 230)}

                      {(job.description || "").length > 230 ? "…" : ""}
                    </p>

                    {!!job.skills?.length && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-[#e9ede2] px-2 py-1 text-[10px] font-semibold text-[#64735c] dark:bg-[#2d392e] dark:text-[#c0cbb8]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start sm:pt-1">
                    <div className="sm:text-right">
                      <p className="text-xl font-semibold tracking-tight text-[#527246] dark:text-[#d9f36a]">
                        {job.similarity == null
                          ? "—"
                          : `${job.similarity.toFixed(0)}%`}
                      </p>

                      <p className={`mt-0.5 text-[9px] ${mutedClass}`}>
                        VECTOR SIMILARITY*
                      </p>

                      {job.salary && job.salary !== "Not disclosed" && (
                        <p
                          className={`mt-2 max-w-36 text-right text-[10px] ${mutedClass}`}
                        >
                          {job.salary}
                        </p>
                      )}
                    </div>

                    {job.url ? (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#bdcbb2] px-3 py-2 text-[11px] font-bold text-[#476b3e] transition hover:border-[#254b35] hover:bg-[#254b35] hover:text-white dark:border-[#586b4d] dark:text-[#c2dfa5] dark:hover:border-[#d9f36a] dark:hover:bg-[#d9f36a] dark:hover:text-[#203b2a]"
                      >
                        View role <Icon name="external" size={14} />
                      </a>
                    ) : (
                      <span className={`text-[10px] ${mutedClass}`}>
                        Listing unavailable
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {matches.length > 0 && (
            <p className={`mt-4 text-[10px] leading-5 ${mutedClass}`}>
              *Similarity is based on vector distance, not a probability of
              getting hired. Listings and details are supplied by Jobicy.
            </p>
          )}
        </div>
      </section>

      <footer className="border-t border-[#e1e5d9] bg-[#f7f7f0] dark:border-[#303b31] dark:bg-[#141a15]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-[#737d70] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12 dark:text-[#a8b3a5]">
          <a
            className="flex items-center gap-2 font-black text-[#25372b] dark:text-[#edf2e8]"
            href="#top"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#254b35] text-xs text-[#d9f36a] dark:bg-[#d9f36a] dark:text-[#203b2a]">
              m.
            </span>
            matchwise<span className="text-[#8eb66e]">.</span>
          </a>

          <span>Built for the work you want to do.</span>

          <a
            href="#top"
            className="font-bold text-[#527246] dark:text-[#c2dfa5]"
          >
            Back to top ↑
          </a>
        </div>
      </footer>
    </main>
  );
}
