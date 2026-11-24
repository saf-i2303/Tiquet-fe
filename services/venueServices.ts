import { api, unwrap } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

/** Shape venue sesuai kontrak backend /api/v1/organizer/venues. */
export type VenueRecord = {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity?: number;
};

export type VenuePayload = {
  name: string;
  address: string;
  city: string;
  capacity?: number;
};

/** POST /api/v1/organizer/venues */
export async function createVenue(payload: VenuePayload): Promise<VenueRecord> {
  return unwrap(await api.post<ApiResponse<VenueRecord>>("/organizer/venues", payload));
}

/** GET /api/v1/organizer/venues */
export async function listVenues(): Promise<VenueRecord[]> {
  return unwrap(await api.get<ApiResponse<VenueRecord[]>>("/organizer/venues"));
}

/** GET /api/v1/organizer/venues/:id */
export async function getVenue(id: string): Promise<VenueRecord> {
  return unwrap(
    await api.get<ApiResponse<VenueRecord>>(
      `/organizer/venues/${encodeURIComponent(id)}`,
    ),
  );
}

/** PUT /api/v1/organizer/venues/:id */
export async function updateVenue(
  id: string,
  payload: VenuePayload,
): Promise<VenueRecord> {
  return unwrap(
    await api.put<ApiResponse<VenueRecord>>(
      `/organizer/venues/${encodeURIComponent(id)}`,
      payload,
    ),
  );
}

/** DELETE /api/v1/organizer/venues/:id */
export async function deleteVenue(id: string): Promise<void> {
  await api.delete(`/organizer/venues/${encodeURIComponent(id)}`);
}
