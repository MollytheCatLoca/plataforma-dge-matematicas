// src/utils/retryImport.ts
export function retryImport<T>(
    fn: () => Promise<T>,
    retriesLeft = 3,
    interval = 500
  ): Promise<T> {
    return fn().catch((err) => {
      if (retriesLeft === 1) {
        return Promise.reject(err);
      }
      return new Promise<T>((resolve) =>
        setTimeout(
          () => resolve(retryImport(fn, retriesLeft - 1, interval)),
          interval
        )
      );
    });
  }
  