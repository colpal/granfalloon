export default async (algorithm, message) => {
  const encoded = new TextEncoder().encode(message);
  const ab = await crypto.subtle.digest(algorithm, encoded);
  return Array.from(new Uint8Array(ab)).map((b) => b.toString(16)).join("");
};
