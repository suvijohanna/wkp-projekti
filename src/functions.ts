const fetchData = async <T> (url: string, options = {}): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error ${response.status} occurred`);
  }
  const json = response.json();
  return json;
};

export {fetchData};
