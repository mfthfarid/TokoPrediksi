// Backend punya 2 bentuk error:
// - { error: "..." }               -> dari service/business logic
// - { errors: { field: "..." } }   -> dari validasi binding (field-level)
// Helper ini nyoba dua-duanya, ambil pesan pertama yang ketemu.
export const extractErrorMessage = (
  error: any,
  fallback = 'Terjadi kesalahan',
): string => {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (data.error) return data.error;

  if (data.errors) {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey) return data.errors[firstKey] || fallback;
  }

  return fallback;
};
