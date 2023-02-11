import * as bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  } catch (e) {
    debugger;
    throw e;
  }
};
