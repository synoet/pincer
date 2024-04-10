import { UserSettings } from "shared";
import axios from "axios";

export async function getUserSettings(
  id: string
): Promise<UserSettings | null> {
  return axios
    .get(`${process.env['BASE_URL']}/settings/${id}`, {
    })
    .then((response) => {
      return response.data;
    });
}
