import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore"

import { db } from "../firebase"

function useProjects(ownerId = null) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      setError("")

      try {
        let projectsQuery

        if (ownerId) {
          projectsQuery = query(
            collection(db, "projects"),
            where("ownerId", "==", ownerId)
          )
        } else {
          projectsQuery = collection(db, "projects")
        }

        const snapshot = await getDocs(projectsQuery)

        const projectData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))

        setProjects(projectData)
      } catch (error) {
        console.error("Error fetching projects:", error)
        setError("Failed to load projects.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [ownerId])

  return {
    projects,
    loading,
    error,
  }
}

export default useProjects