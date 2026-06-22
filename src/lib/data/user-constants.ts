/** Staff organization departments (user assignment — not test catalog departments). */
export const USER_DEPARTMENT_OPTIONS = [
  'Reception',
  'Hematology',
  'Biochemistry',
  'Microbiology',
  'Pathology',
  'Administration',
] as const;

export type UserDepartment = (typeof USER_DEPARTMENT_OPTIONS)[number];
