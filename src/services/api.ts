import axios from 'axios';
import { ApiDomain } from '../constants';

export const api = axios.create({
  baseURL: ApiDomain,
  headers: {
    'Content-Type': 'application/json',
  },
}); 