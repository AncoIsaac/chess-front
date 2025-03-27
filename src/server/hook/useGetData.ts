import useSWR, { SWRConfiguration } from "swr"
import Api from "../CustomFech"

const fetcher = async (url: string) => {
   const res = await Api.get(url)
   return res.data 
}

const useGetData = <T>(url: string, config?: SWRConfiguration) => {
    const {data, error, isLoading, mutate} = useSWR<T>(url, fetcher, config)
  
    return {
        data,
        error,
        isLoading,
        mutate
    }
}

export default useGetData