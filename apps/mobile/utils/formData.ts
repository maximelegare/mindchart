type args = {
  name: string;
  value: string | Blob | undefined;
}[];

export const makeFormData = (args: args) => {
  const formData = new FormData();

  args.forEach(({ name, value }) => {
    if (!value) return;

    formData.append(name, value);
  });
  return formData;
};

export const getFileFromFormData = async (request: Request, key: string) => {
  try {
    const formData = await request.formData();
    //@ts-expect-error /// Get doesnt exist in types, but it works.
    return formData.get(key) as File;
  } catch (error) {
    console.error(error);
  }
};
