export type FirstArg<T> = T extends (arg: infer U, ...args: unknown[]) => unknown ? U : never;
