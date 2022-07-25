export async function load(path) {
  return JSON.parse(await Deno.readTextFile(path));
}
