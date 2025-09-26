export const getInitial = (name: string): string => {
  if (!name) return '';
  return name.trim().charAt(0).toUpperCase();
};

export const userData = {
  fullName: 'Kushagra Bisht',
  roomNo: 'C-11'
};