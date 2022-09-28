import { assertEquals } from "./deps.ts";
import { shift } from "./url.js";

function assertURLEquals(actual, expected) {
  for (const property of ["method", "url", "headers"]) {
    assertEquals(actual[property], expected[property]);
  }
}

Deno.test("shift", () => {
  const actual = shift(
    "https://api.example.com",
    new Request("http://localhost/user"),
    "banana",
  );
  const expected = new Request("https://api.example.com/user", {
    headers: { authorization: "token banana" },
  });
  assertURLEquals(actual, expected);
});
