import { Transform } from 'class-transformer';

// Query strings arrive as text: "true"/"false" become booleans, anything else is
// left as is so @IsBoolean() rejects it
export const ToBoolean = () =>
  Transform(({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value));
