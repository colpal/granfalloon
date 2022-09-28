import { assertEquals } from "./deps.ts";
import { shift } from "./url.js";

function assertURLEquals(actual, expected) {
  for (const property of ["method", "url", "headers"]) {
    assertEquals(actual[property], expected[property]);
  }
}

const token = "banana";

Deno.test("shift", () => {
  const actual = shift(
    "https://api.example.com",
    token,
    new Request(
      "http://localhost/user",
    ),
  );
  const expected = new Request("https://api.example.com/user", {
    headers: { authorization: `token ${token}` },
  });
  assertURLEquals(actual, expected);
});

Deno.test("shift with query", () => {
  const actual = shift(
    "https://api.example.com",
    token,
    new Request(
      "http://localhost/user?page=2",
    ),
  );
  const expected = new Request("https://api.example.com/user?page=2", {
    headers: { authorization: `token ${token}` },
  });
  assertURLEquals(actual, expected);
});

Deno.test("shift with header", () => {
  const actual = shift(
    "https://api.example.com",
    token,
    new Request(
      "http://localhost/user",
      { headers: { "x-header": 42 } },
    ),
  );
  const expected = new Request("https://api.example.com/user", {
    headers: {
      authorization: `token ${token}`,
      "x-header": 42,
    },
  });
  assertURLEquals(actual, expected);
});

Deno.test("shift with ports", () => {
  const actual = shift(
    "https://api.example.com:8443",
    token,
    new Request("http://localhost:8000/user"),
  );
  const expected = new Request("https://api.example.com:8443/user", {
    headers: {
      authorization: `token ${token}`,
    },
  });
  assertURLEquals(actual, expected);
});
