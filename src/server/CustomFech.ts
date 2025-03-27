import axios, { AxiosInstance } from 'axios';

export const URL = import.meta.env.VITE_URL;
// export const URLSocket = import.meta.env.VITE_API_socket;

const Api: AxiosInstance = axios.create({
  baseURL: `${URL}`, // URL base de tu API
  headers: {
    'Content-Type': 'application/json', // Tipo de contenido por defecto
  },
});

export default Api;