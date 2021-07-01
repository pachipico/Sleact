import React, { SetStateAction, useCallback, useState } from 'react';

const useInput = <T = any>(initalValue: T): [T, (e: any) => void, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState(initalValue);
  const handler = useCallback((e: any) => {
    setValue(e.currentTarget.value);
  }, []);
  return [value, handler, setValue];
};

export default useInput;
