// Values of a ts-proto string enum. UNRECOGNIZED is a ts-proto artifact, not a valid value to send
export const enumValues = <T extends Record<string, string>>(enumObject: T) =>
  Object.values(enumObject).filter((value) => value !== 'UNRECOGNIZED') as Exclude<T[keyof T], 'UNRECOGNIZED'>[];

export const enumMessage = (field: string, values: readonly string[]) =>
  `Possible ${field} values are ${values.join(', ')}`;
