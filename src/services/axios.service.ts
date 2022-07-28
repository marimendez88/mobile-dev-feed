



import { parse } from '@babel/parser';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

export class AxiosBaseService {
  environment = {
    apiURL: 'http://localhost:3000/api',
  }

  private mockAPI:AxiosInstance = axios.create({
    baseURL: 'https://behavior-boost.proxy.beeceptor.com',
    withCredentials: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  private apiBoost:AxiosInstance = axios.create({
    baseURL: this.environment.apiURL,
    withCredentials: true,
    headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
  });




  public getAxiosCall = async (endpoint: string) => {

     return this.apiBoost.get<AxiosResponse>(
      endpoint
      ).catch((err: AxiosError) => {
       this.handleError(err);
       return err.response;
      });
  };
  public postAxiosCall = async (endpoint: string, data: any,) => {
      return this.apiBoost.post<AxiosResponse>(
        endpoint,
        data
      ).catch((err: AxiosError) => {
       this.handleError(err);
       return err.response;
      });
  };

  public updateAxiosCall = async (endpoint: string, data: any) => {
    try {
      return this.apiBoost.put<AxiosResponse>(
        endpoint,
        data
      ) as unknown as AxiosResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('error message: ', error.message);
        return { data: null, error };
      } else {
        console.error('unexpected error: ', error);
        return { data: null, error: 'An unexpected error occurred' };
      }
    }
  };

  private handleError = (error: AxiosError) => {
    const errorStatus:number = error?.response?.status as number;
    
    switch (errorStatus) {
      case 401:
        console.error('Unauthorized request, redirecting to login');
     break;
      case 403:
        console.error('Forbidden');
        break;
      case 404:
        console.error('Not Found');
        break;
      case 500:
        console.error('Internal Server Error');
        break;
      default:
        console.error('An unexpected error occurred');
        break;
    }
  };




}
