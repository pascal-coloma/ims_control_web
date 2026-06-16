import { del, get, post } from "./client";
import type {
  AddStaffRequest,
  AddStaffResponse,
  PersonalListItem,
} from "../types/api";

export function getPersonal(): Promise<PersonalListItem[]> {
  return get<PersonalListItem[]>("/ims/api/personal/");
}

export function addPersonal(data: AddStaffRequest): Promise<AddStaffResponse> {
  return post<AddStaffResponse>("/ims/api/personal/add/", data);
}

export function deletePersonal(
  id: number,
): Promise<{ success: string; suscripciones_eliminadas: number }> {
  return del(`/ims/api/personal/delete/?personal_id=${id}`);
}
