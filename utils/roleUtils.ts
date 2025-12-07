export function getRoleFromEmail(email: string): 'admin' | 'student' {
  const lower = email.toLowerCase();
  if (lower === 'shaswatrastogi91@gmail.com') return 'admin';
  return 'student';
}
