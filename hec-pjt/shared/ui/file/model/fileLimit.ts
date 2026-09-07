export const toFileArray = (files: File[] | FileList) => [...files];

export const getUploadableFiles = ({
  selectedFiles,
  currentFileCount,
  maxFileCount,
}: {
  selectedFiles: File[] | FileList;
  currentFileCount: number;
  maxFileCount?: number;
}): File[] => {
  const fileArray = toFileArray(selectedFiles);

  if (maxFileCount === 1) return fileArray.slice(0, 1);
  if (maxFileCount === undefined) return fileArray;

  const remainingFileCount = Math.max(maxFileCount - currentFileCount, 0);

  return fileArray.slice(0, remainingFileCount);
};
