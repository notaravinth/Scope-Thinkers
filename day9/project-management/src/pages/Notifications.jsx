import { useEffect, useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

function Notifications() {
  const { currentUser } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] =
    useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationData =
          snapshot.docs.map(
            (notificationDoc) => ({
              id: notificationDoc.id,
              ...notificationDoc.data(),
            })
          );

        notificationData.sort((a, b) => {
          const timeA =
            a.createdAt?.toMillis?.() || 0;
          const timeB =
            b.createdAt?.toMillis?.() || 0;

          return timeB - timeA;
        });

        setNotifications(notificationData);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Error loading notifications:",
          error
        );
        setError(
          "Failed to load notifications."
        );
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const invitationsQuery = query(
      collection(db, "projectInvitations"),
      where(
        "invitedUserId",
        "==",
        currentUser.uid
      )
    );

    const unsubscribe = onSnapshot(
      invitationsQuery,
      (snapshot) => {
        const invitationData =
          snapshot.docs.map(
            (invitationDoc) => ({
              id: invitationDoc.id,
              ...invitationDoc.data(),
            })
          );

        setInvitations(invitationData);
      },
      (error) => {
        console.error(
          "Error loading invitations:",
          error
        );
      }
    );

    return unsubscribe;
  }, [currentUser]);

  async function handleAccept(invitation) {
    if (!currentUser) return;

    try {
      setProcessingId(invitation.id);
      setError("");

      const projectRef = doc(
        db,
        "projects",
        invitation.projectId
      );

      const projectSnapshot =
        await getDoc(projectRef);

      if (!projectSnapshot.exists()) {
        setError("The project no longer exists.");
        return;
      }

      const projectData =
        projectSnapshot.data();

      await updateDoc(projectRef, {
        memberIds: arrayUnion(
          projectData.ownerId,
          currentUser.uid
        ),
      });

      const invitationRef = doc(
        db,
        "projectInvitations",
        invitation.id
      );

      await updateDoc(invitationRef, {
        status: "accepted",
      });

      const relatedNotification =
        notifications.find(
          (notification) =>
            notification.projectId ===
              invitation.projectId &&
            notification.type === "project_invite" &&
            !notification.isRead
        );

      if (relatedNotification) {
        await updateDoc(
          doc(
            db,
            "notifications",
            relatedNotification.id
          ),
          {
            isRead: true,
          }
        );
      }
    } catch (error) {
      console.error(
        "Error accepting invitation:",
        error
      );
      setError(
        "Failed to accept invitation."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDecline(invitation) {
    try {
      setProcessingId(invitation.id);
      setError("");

      const invitationRef = doc(
        db,
        "projectInvitations",
        invitation.id
      );

      await updateDoc(invitationRef, {
        status: "declined",
      });

      const relatedNotification =
        notifications.find(
          (notification) =>
            notification.projectId ===
              invitation.projectId &&
            notification.type === "project_invite" &&
            !notification.isRead
        );

      if (relatedNotification) {
        await updateDoc(
          doc(
            db,
            "notifications",
            relatedNotification.id
          ),
          {
            isRead: true,
          }
        );
      }
    } catch (error) {
      console.error(
        "Error declining invitation:",
        error
      );
      setError(
        "Failed to decline invitation."
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading notifications...
        </p>
      </div>
    );
  }

  const pendingInvitations =
    invitations.filter(
      (invitation) =>
        invitation.status === "pending"
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Invitations and other activity from your
          projects.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      {pendingInvitations.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Project Invitations
          </h2>

          <div className="space-y-3">
            {pendingInvitations.map(
              (invitation) => {
                const isProcessing =
                  processingId ===
                  invitation.id;

                return (
                  <div
                    key={invitation.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                        📩
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Project invitation
                        </h3>

                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          You were invited to join{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {invitation.projectName}
                          </span>
                          .
                        </p>

                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          Invited by{" "}
                          {invitation.invitedByEmail}
                        </p>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleAccept(
                                invitation
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Accept"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDecline(
                                invitation
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Activity
        </h2>

        {notifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No notifications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border bg-white p-4 dark:bg-gray-900 ${
                    notification.isRead
                      ? "border-gray-200 dark:border-gray-800"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      🔔
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.message}
                      </p>

                      {!notification.isRead && (
                        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                          New
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;