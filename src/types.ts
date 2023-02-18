import { Stream } from "node:stream";

export type Orientation = "Landscape" | "Portrait";

export interface WkOptions {
  // URI or Stream providing HTML input
  input: string | Stream;
  // Defaults to Portrait
  orientation?: Orientation;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}

export const ValidateGeneratePdfRequest = (options: WkOptions) => {
  const validationErrors: string[] = [];
  const addError = (error: string) => validationErrors.push(error);

  const orientations = ["Landscape", "Portrait"];
  if (!options.orientation || !orientations.includes(options.orientation))
    addError(`${options.orientation} not in ${orientations.join()}`);

  const isNotValidSize = (n: unknown) => typeof n !== "number" || n < 0;
  if (isNotValidSize(options.marginTop))
    addError("'marginTop' not valid");
  if (isNotValidSize(options.marginRight))
    addError("'marginRight' not valid");
  if (isNotValidSize(options.marginBottom))
    addError("'marginBottom' not valid");
  if (isNotValidSize(options.marginLeft))
    addError("'marginLeft' not valid");

  if (validationErrors.length) throw new Error(validationErrors.join(", "));
};
