import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { notifyError, notifySuccess } from "../lib/Toasting";

const useErrors = (errors = []) => {
  useEffect(() => {
    errors.forEach(({ isError, error, fallback }) => {
      if (isError) {
        console.log(isError , error)
        if (fallback) fallback();
        else notifyError(error.response.data.message || "Something went wrong");
      }
    });
  }, [errors]);
};

const useAsyncMutation = (mutation) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  const executeMutation = async (toastMessage, ...args) => {
    setIsLoading(true);
    const toastId = toast.loading(toastMessage || "Updating data...");

    try {
      const res = await mutation.mutateAsync(...args);
      console.log(res);
      if (res.success) {
        notifySuccess(res?.message || "Updated data successfully", {
          id: toastId,
        });
        setData(res.data);
      } else {
        notifyError( "Something went wrong", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      notifyError(error?.response?.data?.message || "Something went wrong", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return [ executeMutation, isLoading, data ];
};




  function useSocketEvents(socket, handlers) {
    useEffect(() => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.on(event, handler);
      });

      return () => {
        Object.entries(handlers).forEach(([event, handler]) => {
          socket.off(event, handler);
        });
      };
    }, [socket, handlers]);
  }
  
  export {useSocketEvents ,useErrors , useAsyncMutation};