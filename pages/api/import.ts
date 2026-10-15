import type { NextApiRequest, NextApiResponse } from "next";

type ImportError = { error: string };

export const config = {
  api: { bodyParser: false },
};

export default function importHandler(
  request: NextApiRequest,
  response: NextApiResponse<ImportError>,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método no permitido." });
  }

  return response
    .status(501)
    .json({ error: "C-IMPORT todavía no está habilitado." });
}
