export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export const urlValidationSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      minLength: 1,
      customValidator: isValidUrl
    }
  },
  required: ['url']
};
