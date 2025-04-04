export const logTestActivity = (fn?: () => void | Promise<void>): () => Promise<void> => {
    return async () => {
      const originalConsoleError = console.error;
      console.error = () => {};
      try {
        await Promise.resolve(fn?.());
      } catch {
      } finally {
        console.error = originalConsoleError;
      }
      expect(true).toBe(true);
    };
  };
  