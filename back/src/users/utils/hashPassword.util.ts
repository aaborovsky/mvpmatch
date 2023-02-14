import * as bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 12;

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
