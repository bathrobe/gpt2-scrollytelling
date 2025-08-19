declare module 'react-scrollama' {
  import { ReactNode } from 'react';

  interface ScrollamaProps {
    offset?: number;
    onStepEnter?: (response: { data: any; element: HTMLElement; index: number; direction: string }) => void;
    onStepExit?: (response: { data: any; element: HTMLElement; index: number; direction: string }) => void;
    onStepProgress?: (response: { data: any; element: HTMLElement; index: number; progress: number }) => void;
    children?: ReactNode;
    debug?: boolean;
  }

  interface StepProps {
    data?: any;
    children?: ReactNode;
  }

  export const Scrollama: React.FC<ScrollamaProps>;
  export const Step: React.FC<StepProps>;
}