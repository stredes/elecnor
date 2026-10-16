export class ImportInterpretationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "ImportInterpretationError";
  }
}
