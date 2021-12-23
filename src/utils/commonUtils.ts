export const isSameArray = (arrayA: string[] | undefined, arrayB: string[] | undefined) => {
  if (!arrayA || !arrayB) {
    return false;
  }
  if (arrayA.length !== arrayB.length) {
    return false;
  }

  const index = arrayA.findIndex(item => arrayB.indexOf(item) < 0);
  if (index < 0) {
    return true;
  } else {
    return false;
  }
}
