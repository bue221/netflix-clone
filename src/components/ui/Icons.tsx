import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

export const PlayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 2.7a1 1 0 0 1 1.48-.88l16.93 9.3a1 1 0 0 1 0 1.76L6.48 22.18A1 1 0 0 1 5 21.3V2.7Z" />
  </Icon>
);

export const InfoIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      fillRule="evenodd"
      d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM1 12C1 5.92 5.92 1 12 1s11 4.92 11 11-4.92 11-11 11S1 18.08 1 12Zm12-2v8h-2v-8h2Zm-1-1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
    />
  </Icon>
);

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M11 11V2h2v9h9v2h-9v9h-2v-9H2v-2h9Z" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m8.68 17.2-5.97-5.98-1.42 1.42 7.39 7.39L22.7 5.99l-1.42-1.41L8.68 17.2Z" />
  </Icon>
);

export const ThumbUpIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      fillRule="evenodd"
      d="M10.7 2.3a1 1 0 0 1 1.17-.27c1.52.68 2.3 2.06 2.3 3.58 0 .83-.2 1.7-.43 2.39h5.08a2.5 2.5 0 0 1 2.43 3.1l-1.75 7A2.5 2.5 0 0 1 17.08 20H7v-9.4l3.7-8.3ZM9 11.03V18h8.08a.5.5 0 0 0 .49-.38l1.75-7a.5.5 0 0 0-.49-.62H12a1 1 0 0 1-.9-1.43c.37-.77.93-2.03.93-2.96 0-.53-.17-.98-.48-1.3L9 11.03ZM2 10h3v10H2V10Z"
    />
  </Icon>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m19.29 7.29-7.29 7.3-7.29-7.3-1.42 1.42L12 17.41l8.71-8.7-1.42-1.42Z" />
  </Icon>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m15.21 2.79-9.2 9.21 9.2 9.21 1.42-1.42L8.83 12l7.8-7.79-1.42-1.42Z" />
  </Icon>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m8.79 21.21 9.2-9.21-9.2-9.21-1.42 1.42L15.17 12l-7.8 7.79 1.42 1.42Z" />
  </Icon>
);

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      fillRule="evenodd"
      d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.38 7.03a9 9 0 1 1 1.41-1.41l5.68 5.67-1.42 1.42-5.67-5.68Z"
    />
  </Icon>
);

export const BellIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      fillRule="evenodd"
      d="M13 4.07A7 7 0 0 1 19 11v4.25l1.7 1.7c.19.18.3.44.3.7V19a1 1 0 0 1-1 1h-4.13a4 4 0 0 1-7.74 0H4a1 1 0 0 1-1-1v-1.34c0-.27.1-.53.3-.71L5 15.25V11a7 7 0 0 1 6-6.93V2h2v2.07ZM10.27 20a2 2 0 0 0 3.46 0h-3.46ZM12 6a5 5 0 0 0-5 5v4.66a1 1 0 0 1-.3.7L5 18.08V18h14v.08l-1.7-1.71a1 1 0 0 1-.3-.7V11a5 5 0 0 0-5-5Z"
    />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m10.59 12-7.3 7.3 1.42 1.4L12 13.42l7.3 7.3 1.4-1.42L13.42 12l7.3-7.3-1.42-1.4L12 10.58l-7.3-7.3-1.4 1.42L10.58 12Z" />
  </Icon>
);

export const CaretDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 10l5 5 5-5H7Z" />
  </Icon>
);
