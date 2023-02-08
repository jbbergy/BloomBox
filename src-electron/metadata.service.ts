import jsmediatags from 'jsmediatags'

export function readMetadata(file) {
  return new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => {
        resolve(tag);
      },
      onError: (error) => {
        console.error('SERVER readMetadata error', error)
        reject(error);
      },
    });
  });
}
