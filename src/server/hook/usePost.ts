import useSWRMutation from "swr/mutation";
import Api from "../CustomFech";

const sendData = async <T, R>(url: string, { arg }: { arg: T }): Promise<R> => {
  const response = await Api.post(url, arg);
  return response.data;
};

export const usePost = <T, R = any>(endpoint: string) => {
  return useSWRMutation<R, Error, string, T>(endpoint, sendData);
};
