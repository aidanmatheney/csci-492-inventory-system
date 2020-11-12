export const timeoutPromise = (timeoutMs: number) => {
  return new Promise<void>(resolve => setTimeout(resolve, timeoutMs));
};
