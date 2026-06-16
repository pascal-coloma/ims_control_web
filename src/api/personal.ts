import { get, post } from "./client";
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
