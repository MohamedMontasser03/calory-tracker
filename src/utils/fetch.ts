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
    if (response.status >= 400) {
      throw new Error(await response.text());
    }
    return response.json();
  } catch (err) {
    console.error(err);
  }
};
