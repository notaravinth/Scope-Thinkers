import { supabase } from "./supabase";

function getErrorMessage(error, fallback) {
  if (error?.message) return error.message;
  return fallback;
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error("You must be signed in to continue.");

  return data.user.id;
}

function mapVehicle(row) {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: String(row.year ?? ""),
    fuel: row.fuel_type || "Petrol",
    transmission: row.transmission || "Manual",
    reg: row.registration_number || "Registration not added",
    km: String(row.current_mileage ?? 0),
    color: "#D6DAD7",
    nickname: row.variant || "My vehicle",
  };
}

const statusLabels = {
  submitted: "Submitted",
  under_review: "Inspection",
  approved: "Awaiting approval",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function mapServiceRequest(row) {
  const vehicle = row.vehicles;

  return {
    id: row.id,
    title: row.description || row.issue_type,
    car: vehicle ? `${vehicle.brand} ${vehicle.model}` : "Vehicle",
    reg: vehicle?.registration_number || "Registration not added",
    category: row.issue_type,
    priority: "Medium",
    status: statusLabels[row.status] || "Submitted",
    date: new Date(row.created_at).toLocaleString(),
    advisor: "Awaiting assignment",
    vehicleId: row.vehicle_id,
    description: row.description || "",
    location: row.location || "",
    appointmentAt: row.appointment_at,
    estimatedCost: row.estimated_cost,
  };
}

export async function getVehicles() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error, "Could not load vehicles."));
  }

  return (data || []).map(mapVehicle);
}

export async function addVehicle(vehicle) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      user_id: userId,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year ? Number(vehicle.year) : null,
      variant: vehicle.nickname || null,
      fuel_type: vehicle.fuel || null,
      transmission: vehicle.transmission || null,
      registration_number: vehicle.reg?.trim() || null,
      current_mileage: vehicle.km ? Number(vehicle.km) : 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error, "Could not add vehicle."));
  }

  return mapVehicle(data);
}

export async function deleteVehicle(vehicleId) {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(getErrorMessage(error, "Could not delete vehicle."));
  }
}

export async function getServiceRequests() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("service_requests")
    .select(
      `
      *,
      vehicles (
        brand,
        model,
        registration_number
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error, "Could not load service requests."));
  }

  return (data || []).map(mapServiceRequest);
}

export async function addServiceRequest(request) {
  const userId = await getCurrentUserId();

  if (!request.vehicleId) {
    throw new Error("Select a saved vehicle before submitting a request.");
  }

  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      user_id: userId,
      vehicle_id: request.vehicleId,
      issue_type: request.category,
      description: request.description?.trim() || null,
      location: request.location?.trim() || null,
      status: "submitted",
      appointment_at: request.preferredDate
        ? new Date(`${request.preferredDate}T09:00:00`).toISOString()
        : null,
    })
    .select(
      `
      *,
      vehicles (
        brand,
        model,
        registration_number
      )
    `,
    )
    .single();

  if (error) {
    throw new Error(
      getErrorMessage(error, "Could not submit service request."),
    );
  }

  return mapServiceRequest(data);
}
