import type { NextApiRequest, NextApiResponse } from "next";
import { importCommand } from "@/backend/composition/import";
import {
  ImportFormError,
  importFilesFromFormData,
} from "@/backend/adapters/inbound/import-form";
import { mapImportError } from "@/backend/adapters/inbound/import-errors";
import type { ImportResponse } from "@/backend/adapters/inbound/import-response-contract";

export const config = {
  api: { bodyParser: false },
};

export default function importHandler(
  request: NextApiRequest,
  response: NextApiResponse<ImportResponse>,
): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Método no permitido." });
    return Promise.resolve();
  }

  return readMultipart(request)
    .then((form) => importCommand.execute(importFilesFromFormData(form)))
    .then((summary) => {
      response.status(200).json(summary);
    })
    .catch((error: unknown) => {
      const mapped = mapImportError(error);
      response.status(mapped.status).json(mapped.body);
    });
}

async function readMultipart(request: NextApiRequest): Promise<FormData> {
  const contentType = request.headers["content-type"];
  if (typeof contentType !== "string" || !contentType.startsWith("multipart/form-data")) {
    throw new ImportFormError();
  }
  const init = {
    method: "POST",
    headers: { "content-type": contentType },
    body: request as unknown as BodyInit,
    duplex: "half",
  } as RequestInit & { duplex: "half" };
  return new Request("http://localhost/api/import", init).formData();
}
