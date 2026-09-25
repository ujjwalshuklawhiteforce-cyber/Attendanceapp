// contexts/LoaderContext.tsx
import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
  } from "react";
  
  interface LoaderContextData {
    isLoading: boolean;
    setIsLoading: (newdata:boolean) => void,
  }
  
  var initialValue = {
    isLoading: false,
    setIsLoading: () =>{}
  }
  
  const LoaderContext = createContext<LoaderContextData>(initialValue);
  
  export const LoaderProvider: React.FC<{ children: ReactNode }> = ({
    children,
  }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    return (
      <LoaderContext.Provider value={{ isLoading, setIsLoading }}>
        {children}
      </LoaderContext.Provider>
    );
  };
  
  export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (context === undefined) {
      throw new Error("useLoader must be used within an LoaderProvider");
    }
    return context;
  };
  