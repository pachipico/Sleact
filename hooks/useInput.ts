// import React, { SetStateAction, useCallback, useState } from 'react';

// const useInput = <T = any>(initalValue: T): [T, (e: any) => void, React.Dispatch<React.SetStateAction<T>>] => {
//   const [value, setValue] = useState(initalValue);
//   const handler = useCallback((e: any) => {
//     setValue(e.currentTarget.value);
//   }, []);
//   return [value, handler, setValue];
// };

// export default useInput;

import { Dispatch, SetStateAction, useCallback, useState, ChangeEvent } from 'react';

type ReturnTypes<T> = [T, (e: ChangeEvent<HTMLInputElement>) => void, Dispatch<SetStateAction<T>>];

const useInput = <T>(initialData: T): ReturnTypes<T> => {
  const [value, setValue] = useState(initialData);
  const handler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue((e.target.value as unknown) as T);
  }, []);
  return [value, handler, setValue];
};

export default useInput;
