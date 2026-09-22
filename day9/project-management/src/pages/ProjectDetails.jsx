import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { Link, useParams } from "react-router-dom";

import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

import CreateTaskForm from "../components/CreateTaskForm";
import TaskColumn from "../components/TaskColumn";

import {
  updateTaskPositions,
} from "../services/taskService";

import {
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";

import {
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge";

import {
  getReorderDestinationIndex,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";

function ProjectDetails() {
  const { projectId } = useParams();

  const { currentUser } = useAuth();

  const [project, setProject] =
    useState(null);

  const [members, setMembers] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [membersLoading, setMembersLoading] =
    useState(true);

  const [tasksLoading, setTasksLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showInviteForm, setShowInviteForm] =
    useState(false);

  const [showTaskForm, setShowTaskForm] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [inviteError, setInviteError] =
    useState("");

  const [inviteSuccess, setInviteSuccess] =
    useState("");

  const [inviteLoading, setInviteLoading] =
    useState(false);

  /*
   * -----------------------------------------
   * Load Project
   * -----------------------------------------
   */

  useEffect(() => {
    if (!projectId) return;

    const projectRef = doc(
      db,
      "projects",
      projectId
    );

    const unsubscribe = onSnapshot(
      projectRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Project not found.");
          setProject(null);
          setLoading(false);
          return;
        }

        setProject({
          id: snapshot.id,
          ...snapshot.data(),
        });

        setLoading(false);
      },
      (error) => {
        console.error(
          "Error loading project:",
          error
        );

        setError(
          "Failed to load project."
        );

        setLoading(false);
      }
    );

    return unsubscribe;
  }, [projectId]);

  /*
   * -----------------------------------------
   * Load Members
   * -----------------------------------------
   */

  useEffect(() => {
    if (!project) {
      setMembers([]);
      setMembersLoading(false);
      return;
    }

    async function loadMembers() {
      try {
        setMembersLoading(true);

        const memberIds = [
          project.ownerId,
          ...(project.memberIds || []),
        ].filter(Boolean);

        const uniqueMemberIds = [
          ...new Set(memberIds),
        ];

        const memberPromises =
          uniqueMemberIds.map(
            async (uid) => {
              const usersQuery =
                query(
                  collection(
                    db,
                    "users"
                  ),
                  where(
                    "uid",
                    "==",
                    uid
                  )
                );

              const userSnapshot =
                await getDocs(
                  usersQuery
                );

              if (
                userSnapshot.empty
              ) {
                console.warn(
                  "User document not found for UID:",
                  uid
                );

                return {
                  uid,
                  name: "Unknown User",
                  email: "",
                };
              }

              const userDoc =
                userSnapshot.docs[0];

              return {
                id: userDoc.id,
                ...userDoc.data(),
              };
            }
          );

        const memberData =
          await Promise.all(
            memberPromises
          );

        memberData.sort(
          (a, b) => {
            if (
              a.uid ===
              project.ownerId
            ) {
              return -1;
            }

            if (
              b.uid ===
              project.ownerId
            ) {
              return 1;
            }

            return 0;
          }
        );

        setMembers(memberData);
      } catch (error) {
        console.error(
          "Error loading members:",
          error
        );
      } finally {
        setMembersLoading(false);
      }
    }

    loadMembers();
  }, [project]);

  /*
   * -----------------------------------------
   * Load Tasks
   * -----------------------------------------
   */

  useEffect(() => {
    if (!projectId) return;

    const tasksQuery = query(
      collection(db, "tasks"),
      where(
        "projectId",
        "==",
        projectId
      )
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const taskData =
          snapshot.docs.map(
            (taskDoc) => ({
              id: taskDoc.id,
              ...taskDoc.data(),
            })
          );

        taskData.sort(
          (a, b) => {
            const positionA =
              a.position || 0;

            const positionB =
              b.position || 0;

            return (
              positionA - positionB
            );
          }
        );

        setTasks(taskData);
        setTasksLoading(false);
      },
      (error) => {
        console.error(
          "Error loading tasks:",
          error
        );

        setTasksLoading(false);
      }
    );

    return unsubscribe;
  }, [projectId]);

  /*
   * -----------------------------------------
   * Invite Member
   * -----------------------------------------
   */

  async function handleInvite(e) {
    e.preventDefault();

    setInviteError("");
    setInviteSuccess("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setInviteError(
        "Please enter an email address."
      );

      return;
    }

    if (!currentUser) {
      setInviteError(
        "You must be logged in."
      );

      return;
    }

    if (!project) {
      setInviteError(
        "Project could not be loaded."
      );

      return;
    }

    try {
      setInviteLoading(true);

      const usersQuery = query(
        collection(db, "users"),
        where(
          "email",
          "==",
          normalizedEmail
        )
      );

      const usersSnapshot =
        await getDocs(
          usersQuery
        );

      if (usersSnapshot.empty) {
        setInviteError(
          "No registered user found with that email."
        );

        return;
      }

      const userDoc =
        usersSnapshot.docs[0];

      const invitedUser =
        userDoc.data();

      if (
        userDoc.id ===
        currentUser.uid
      ) {
        setInviteError(
          "You cannot invite yourself."
        );

        return;
      }

      const memberIds = [
        project.ownerId,
        ...(project.memberIds || []),
      ];

      if (
        memberIds.includes(
          userDoc.id
        )
      ) {
        setInviteError(
          "This user is already a member."
        );

        return;
      }

      const existingInviteQuery =
        query(
          collection(
            db,
            "projectInvitations"
          ),
          where(
            "projectId",
            "==",
            projectId
          ),
          where(
            "invitedUserId",
            "==",
            userDoc.id
          ),
          where(
            "status",
            "==",
            "pending"
          )
        );

      const existingInviteSnapshot =
        await getDocs(
          existingInviteQuery
        );

      if (
        !existingInviteSnapshot.empty
      ) {
        setInviteError(
          "This user already has a pending invitation."
        );

        return;
      }

      await addDoc(
        collection(
          db,
          "projectInvitations"
        ),
        {
          projectId,
          projectName:
            project.name,
          invitedUserId:
            userDoc.id,
          invitedUserEmail:
            invitedUser.email,
          invitedBy:
            currentUser.uid,
          invitedByEmail:
            currentUser.email,
          status: "pending",
          createdAt:
            serverTimestamp(),
        }
      );

      await addDoc(
        collection(
          db,
          "notifications"
        ),
        {
          userId: userDoc.id,
          type: "project_invite",
          projectId,
          message: `${currentUser.email} invited you to join ${project.name}.`,
          isRead: false,
          createdAt:
            serverTimestamp(),
        }
      );

      setEmail("");

      setInviteSuccess(
        "Invitation sent successfully."
      );
    } catch (error) {
      console.error(
        "Error sending invitation:",
        error
      );

      setInviteError(
        "Failed to send invitation. Please try again."
      );
    } finally {
      setInviteLoading(false);
    }
  }

  /*
   * -----------------------------------------
   * Delete Task
   * -----------------------------------------
   */

  async function handleDeleteTask(
    taskId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "tasks", taskId)
      );
    } catch (error) {
      console.error(
        "Error deleting task:",
        error
      );
    }
  }

  /*
   * -----------------------------------------
   * Drag & Drop
   * -----------------------------------------
   */

  useEffect(() => {
    if (!projectId) return;

    return monitorForElements({
      canMonitor({ source }) {
        return (
          source.data?.type ===
          "task" &&
          source.data?.projectId ===
          projectId
        );
      },

      onDrop({
        location,
        source,
      }) {
        const dropTargets =
          location.current
            .dropTargets;

        if (!dropTargets.length) {
          return;
        }

        const sourceTaskId =
          source.data?.taskId;

        const sourceColumnId =
          source.data?.status;

        if (
          typeof sourceTaskId !==
            "string" ||
          typeof sourceColumnId !==
            "string"
        ) {
          return;
        }

        /*
         * --------------------------------
         * Dropped directly into a column
         * --------------------------------
         */

        if (
          dropTargets.length === 1
        ) {
          const destinationColumn =
            dropTargets[0];

          if (
            destinationColumn.data
              ?.type !== "column"
          ) {
            return;
          }

          const destinationColumnId =
            destinationColumn.data
              ?.columnId;

          if (
            typeof destinationColumnId !==
            "string"
          ) {
            return;
          }

          moveTaskToColumn(
            sourceTaskId,
            sourceColumnId,
            destinationColumnId
          );

          return;
        }

        /*
         * --------------------------------
         * Dropped on a task
         * --------------------------------
         */

        const destinationTask =
          dropTargets.find(
            (target) =>
              target.data?.type ===
              "task"
          );

        const destinationColumn =
          dropTargets.find(
            (target) =>
              target.data?.type ===
              "column"
          );

        if (
          !destinationTask ||
          !destinationColumn
        ) {
          return;
        }

        const destinationTaskId =
          destinationTask.data
            ?.taskId;

        const destinationColumnId =
          destinationColumn.data
            ?.columnId;

        if (
          typeof destinationTaskId !==
            "string" ||
          typeof destinationColumnId !==
            "string"
        ) {
          return;
        }

        const closestEdge =
          extractClosestEdge(
            destinationTask.data
          );

        moveTaskRelativeToTask(
          sourceTaskId,
          sourceColumnId,
          destinationColumnId,
          destinationTaskId,
          closestEdge
        );
      },
    });
  }, [tasks, projectId]);

  /*
   * -----------------------------------------
   * Move Task Into Column
   * -----------------------------------------
   */

  async function moveTaskToColumn(
    sourceTaskId,
    sourceColumnId,
    destinationColumnId
  ) {
    const sourceTasks =
      tasks
        .filter(
          (task) =>
            task.status ===
            sourceColumnId
        )
        .sort(
          (a, b) =>
            (a.position || 0) -
            (b.position || 0)
        );

    const destinationTasks =
      tasks
        .filter(
          (task) =>
            task.status ===
              destinationColumnId &&
            task.id !==
              sourceTaskId
        )
        .sort(
          (a, b) =>
            (a.position || 0) -
            (b.position || 0)
        );

    const sourceTask =
      sourceTasks.find(
        (task) =>
          task.id ===
          sourceTaskId
      );

    if (!sourceTask) {
      return;
    }

    /*
     * Same column:
     * dropping directly on the column
     * means move to the end.
     */

    if (
      sourceColumnId ===
      destinationColumnId
    ) {
      const reordered =
        [...sourceTasks];

      const sourceIndex =
        reordered.findIndex(
          (task) =>
            task.id ===
            sourceTaskId
        );

      if (sourceIndex === -1) {
        return;
      }

      reordered.splice(
        sourceIndex,
        1
      );

      reordered.push(
        sourceTask
      );

      const updates =
        reordered.map(
          (task, index) => ({
            taskId: task.id,
            status:
              destinationColumnId,
            position:
              (index + 1) * 1000,
          })
        );

      try {
        await updateTaskPositions(
          updates
        );
      } catch (error) {
        console.error(
          "Error reordering task:",
          error
        );
      }

      return;
    }

    /*
     * Different column.
     * Add task to the end.
     */

    const updatedDestinationTasks =
      [...destinationTasks];

    updatedDestinationTasks.push({
      ...sourceTask,
      status:
        destinationColumnId,
    });

    const updates =
      updatedDestinationTasks.map(
        (task, index) => ({
          taskId: task.id,
          status:
            destinationColumnId,
          position:
            (index + 1) * 1000,
        })
      );

    /*
     * Rebuild source column
     */

    const updatedSourceTasks =
      sourceTasks.filter(
        (task) =>
          task.id !==
          sourceTaskId
      );

    updatedSourceTasks.forEach(
      (task, index) => {
        updates.push({
          taskId: task.id,
          status:
            sourceColumnId,
          position:
            (index + 1) * 1000,
        });
      }
    );

    try {
      await updateTaskPositions(
        updates
      );
    } catch (error) {
      console.error(
        "Error moving task:",
        error
      );
    }
  }

  /*
   * -----------------------------------------
   * Move Task Relative To Another Task
   * -----------------------------------------
   */

  async function moveTaskRelativeToTask(
    sourceTaskId,
    sourceColumnId,
    destinationColumnId,
    destinationTaskId,
    closestEdge
  ) {
    const sourceTasks =
      tasks
        .filter(
          (task) =>
            task.status ===
            sourceColumnId
        )
        .sort(
          (a, b) =>
            (a.position || 0) -
            (b.position || 0)
        );

    const destinationTasks =
      tasks
        .filter(
          (task) =>
            task.status ===
              destinationColumnId &&
            task.id !==
              sourceTaskId
        )
        .sort(
          (a, b) =>
            (a.position || 0) -
            (b.position || 0)
        );

    const sourceTask =
      sourceTasks.find(
        (task) =>
          task.id ===
          sourceTaskId
      );

    if (!sourceTask) {
      return;
    }

    const destinationIndex =
      destinationTasks.findIndex(
        (task) =>
          task.id ===
          destinationTaskId
      );

    if (
      destinationIndex === -1
    ) {
      return;
    }

    /*
     * --------------------------------
     * Same column
     * --------------------------------
     */

    if (
      sourceColumnId ===
      destinationColumnId
    ) {
      const destinationIndexFromEdge =
        getReorderDestinationIndex({
          startIndex:
            sourceTasks.findIndex(
              (task) =>
                task.id ===
                sourceTaskId
            ),

          indexOfTarget:
            destinationIndex,

          closestEdgeOfTarget:
            closestEdge,

          axis: "vertical",
        });

      const reordered =
        [...sourceTasks];

      const sourceIndex =
        reordered.findIndex(
          (task) =>
            task.id ===
            sourceTaskId
        );

      if (sourceIndex === -1) {
        return;
      }

      reordered.splice(
        sourceIndex,
        1
      );

      /*
       * getReorderDestinationIndex
       * gives us the correct final
       * position after accounting
       * for the removed card.
       */

      const safeIndex =
        Math.max(
          0,
          Math.min(
            destinationIndexFromEdge,
            reordered.length
          )
        );

      reordered.splice(
        safeIndex,
        0,
        sourceTask
      );

      const updates =
        reordered.map(
          (task, index) => ({
            taskId: task.id,
            status:
              sourceColumnId,
            position:
              (index + 1) * 1000,
          })
        );

      try {
        await updateTaskPositions(
          updates
        );
      } catch (error) {
        console.error(
          "Error reordering task:",
          error
        );
      }

      return;
    }

    /*
     * --------------------------------
     * Different column
     * --------------------------------
     */

    let insertIndex =
      destinationIndex;

    if (
      closestEdge === "bottom"
    ) {
      insertIndex =
        destinationIndex + 1;
    }

    const updatedDestinationTasks =
      [...destinationTasks];

    updatedDestinationTasks.splice(
      insertIndex,
      0,
      {
        ...sourceTask,
        status:
          destinationColumnId,
      }
    );

    const updates =
      updatedDestinationTasks.map(
        (task, index) => ({
          taskId: task.id,
          status:
            destinationColumnId,
          position:
            (index + 1) * 1000,
        })
      );

    /*
     * Rebuild source column
     */

    const updatedSourceTasks =
      sourceTasks.filter(
        (task) =>
          task.id !==
          sourceTaskId
      );

    updatedSourceTasks.forEach(
      (task, index) => {
        updates.push({
          taskId: task.id,
          status:
            sourceColumnId,
          position:
            (index + 1) * 1000,
        });
      }
    );

    try {
      await updateTaskPositions(
        updates
      );
    } catch (error) {
      console.error(
        "Error moving task:",
        error
      );
    }
  }

  /*
   * -----------------------------------------
   * UI Helpers
   * -----------------------------------------
   */

  function closeInviteForm() {
    setShowInviteForm(false);
    setEmail("");
    setInviteError("");
    setInviteSuccess("");
  }

  const columns = [
    {
      id: "todo",
      title: "To Do",
      description:
        "Tasks that haven't started",
    },
    {
      id: "pending",
      title: "Pending",
      description:
        "Currently in progress",
    },
    {
      id: "delayed",
      title: "Delayed",
      description:
        "Needs attention",
    },
    {
      id: "completed",
      title: "Completed",
      description:
        "Finished tasks",
    },
  ];

  /*
   * -----------------------------------------
   * Loading
   * -----------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white" />

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  /*
   * -----------------------------------------
   * Error
   * -----------------------------------------
   */

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {error ||
              "Project not found"}
          </h1>

          <Link
            to="/projects"
            className="mt-4 inline-block text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const isOwner =
    currentUser?.uid ===
    project.ownerId;

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Project Header */}

      <div className="mb-7">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Projects
        </Link>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {project.name}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isOwner
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {isOwner
                  ? "Owner"
                  : "Member"}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              {project.description ||
                "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Live project
          </div>
        </div>
      </div>

      {/* Main Layout */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Board */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:border-gray-800 dark:bg-gray-900">
          {/* Board Header */}

          <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Project Board
                  </h2>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                    {tasks.length}{" "}
                    {tasks.length ===
                    1
                      ? "task"
                      : "tasks"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
                  Organize and track work
                  across your project.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowTaskForm(
                    (previous) =>
                      !previous
                  )
                }
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {showTaskForm
                  ? "Close"
                  : "+ Create Task"}
              </button>
            </div>
          </div>

          {/* Create Task */}

          {showTaskForm && (
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-800 dark:bg-gray-950">
              <CreateTaskForm
                projectId={projectId}
                members={members}
                onTaskCreated={() =>
                  setShowTaskForm(false)
                }
                onCancel={() =>
                  setShowTaskForm(false)
                }
              />
            </div>
          )}

          {/* Kanban Board */}

          <div className="bg-gray-50/70 p-5 dark:bg-gray-950/70">
            {tasksLoading ? (
              <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                <div className="text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white" />

                  <p className="mt-3 text-sm text-gray-400">
                    Loading tasks...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                {columns.map(
                  (column) => {
                    const columnTasks =
                      tasks
                        .filter(
                          (task) =>
                            task.status ===
                            column.id
                        )
                        .sort(
                          (a, b) =>
                            (a.position ||
                              0) -
                            (b.position ||
                              0)
                        );

                    return (
                      <div
                        key={column.id}
                        className="min-w-0"
                      >
                        <div className="mb-2.5 px-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {
                                  column.title
                                }
                              </h3>

                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 px-1.5 text-[11px] font-semibold text-gray-500">
                                {
                                  columnTasks.length
                                }
                              </span>
                            </div>
                          </div>

                          <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                            {
                              column.description
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-100/70 p-2 dark:border-gray-800 dark:bg-gray-950">
                          <TaskColumn
                            column={column}
                            tasks={columnTasks}
                            onDeleteTask={
                              handleDeleteTask
                            }
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        {/* Members */}

        <aside>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:border-gray-800 dark:bg-gray-900">
            {/* Members Header */}

            <div className="border-b border-gray-200 px-5 py-5 dark:border-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Members
                    </h2>

                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                      {members.length}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
                    People working on this
                    project.
                  </p>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteForm(
                        (previous) =>
                          !previous
                      );

                      setInviteError("");
                      setInviteSuccess("");
                    }}
                    className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    {showInviteForm
                      ? "Close"
                      : "+ Invite"}
                  </button>
                )}
              </div>
            </div>

            {/* Invite Form */}

            {showInviteForm &&
              isOwner && (
                <form
                  onSubmit={handleInvite}
                  className="border-b border-gray-200 bg-gray-50 px-5 py-5 dark:border-gray-800 dark:bg-gray-950"
                >
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Invite by email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="user@example.com"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white dark:focus:ring-white"
                  />

                  {inviteError && (
                    <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                      {inviteError}
                    </p>
                  )}

                  {inviteSuccess && (
                    <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                      {inviteSuccess}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={
                        closeInviteForm
                      }
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        inviteLoading
                      }
                      className="flex-1 rounded-lg bg-gray-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      {inviteLoading
                        ? "Sending..."
                        : "Send Invite"}
                    </button>
                  </div>
                </form>
              )}

            {/* Member List */}

            <div className="p-4">
              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white" />
                </div>
              ) : members.length ===
                0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-gray-700">
                  <p className="text-sm text-gray-400">
                    No members found.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map(
                    (member) => {
                      const memberIsOwner =
                        member.uid ===
                        project.ownerId;

                      const isCurrentUser =
                        member.uid ===
                        currentUser?.uid;

                      const displayName =
                        isCurrentUser
                          ? "You"
                          : member.name ||
                            "User";

                      const initial =
                        displayName
                          ?.charAt(0)
                          .toUpperCase() ||
                        "U";

                      return (
                        <div
                          key={member.uid}
                          className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                              memberIsOwner
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {initial}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {
                                  displayName
                                }
                              </p>

                              {isCurrentUser && (
                                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                              {member.email}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                              memberIsOwner
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {memberIsOwner
                              ? "Owner"
                              : "Member"}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ProjectDetails;