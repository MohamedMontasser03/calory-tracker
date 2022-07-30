export const quickFetch = async <T>(
  url: string,
  method: string = "GET",
  body?: Object
): Promise<T | undefined> => {
  try {
    const response = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  } catch (err) {
    console.error(err);
  }
};
