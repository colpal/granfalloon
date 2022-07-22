export default async (fn, req, res) => {
  try {
    const { status, body, headers } = await fn(req);
    return res
      .writeHead(status ?? 200, headers)
      .end(body);
  } catch (e) {
    console.error(e);
    return res.writeHead(500).end();
  }
};
