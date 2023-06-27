export async function load({ fetch }) {
  try {
    const resp = await fetch('/api/user');
    const { success, user, error } = await resp.json();

    if (!success) {
      throw new Error(error);
    }

    return { user };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
