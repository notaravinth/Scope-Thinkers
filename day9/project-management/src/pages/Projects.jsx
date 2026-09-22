import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Pagination from "rc-pagination";
import { Link } from "react-router-dom";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const PROJECTS_PER_PAGE = 4;

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!currentUser) return;

    let ownedProjects = [];
    let memberProjects = [];

    function updateProjects() {
      const projectMap = new Map();

      ownedProjects.forEach((project) => {
        projectMap.set(project.id, project);
      });

      memberProjects.forEach((project) => {
        projectMap.set(project.id, project);
      });

      const mergedProjects = Array.from(projectMap.values());

      mergedProjects.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;

        return timeB - timeA;
      });

      setProjects(mergedProjects);
      setLoading(false);
    }

    const ownedQuery = query(
      collection(db, "projects"),
      where("ownerId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeOwned = onSnapshot(
      ownedQuery,
      (snapshot) => {
        ownedProjects = snapshot.docs.map((projectDoc) => ({
          id: projectDoc.id,
          ...projectDoc.data(),
        }));

        updateProjects();
      },
      (error) => {
        console.error("Error loading owned projects:", error);
        setLoading(false);
      }
    );

    const memberQuery = query(
      collection(db, "projects"),
      where("memberIds", "array-contains", currentUser.uid)
    );

    const unsubscribeMember = onSnapshot(
      memberQuery,
      (snapshot) => {
        memberProjects = snapshot.docs.map((projectDoc) => ({
          id: projectDoc.id,
          ...projectDoc.data(),
        }));

        updateProjects();
      },
      (error) => {
        console.error("Error loading member projects:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeOwned();
      unsubscribeMember();
    };
  }, [currentUser]);

  const totalPages = Math.ceil(
    projects.length / PROJECTS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * PROJECTS_PER_PAGE;

  const endIndex =
    startIndex + PROJECTS_PER_PAGE;

  const currentProjects = projects.slice(
    startIndex,
    endIndex
  );

  function handlePageChange(page) {
    setCurrentPage(page);
  }

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading projects...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all your projects in one place.
          </p>
        </div>

        <Link
          to="/projects/create"
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          + Create Project
        </Link>
      </div>

      {/* No Projects */}

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            No projects yet
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create your first project to get started.
          </p>

          <Link
            to="/projects/create"
            className="mt-5 inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <>
          {/* Project Cards */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {currentProjects.map((project) => {
              const isOwner =
                project.ownerId === currentUser.uid;

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.name}
                    </h2>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        isOwner
                          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {isOwner ? "Owner" : "Member"}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {project.description ||
                      "No description provided."}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="text-gray-400 dark:text-gray-500">
                      Members
                    </span>

                    <span className="font-medium text-gray-900 dark:text-white">
                      {project.memberIds?.length || 1}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}

          {totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:justify-between">
              {/* Results */}

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {startIndex + 1}
                </span>{" "}
                –{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {Math.min(
                    endIndex,
                    projects.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {projects.length}
                </span>{" "}
                projects
              </p>

              {/* Controls */}

              <Pagination
                current={currentPage}
                total={projects.length}
                pageSize={PROJECTS_PER_PAGE}
                onChange={handlePageChange}
                showLessItems
                showTitle={false}
                className="project-pagination"
              />
            </div>
          )}

          {/* Single-page project count */}

          {totalPages <= 1 && (
            <div className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
              {projects.length}{" "}
              {projects.length === 1
                ? "project"
                : "projects"}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Projects;