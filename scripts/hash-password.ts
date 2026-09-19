#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import { hashPassword } from '../server/auth.ts';

/**
 * Print the two environment variables a hosted SatzWerk needs.
 *
 *   npm run hash-password
 *
 * The password is read from the terminal and never written anywhere: not to a
 * file, not to the shell history, not into the repository. Only the hash is
 * printed, and only the hash goes into the hosting provider's settings.
 *
 * It is read from stdin rather than taken as an argument on purpose — an
 * argument would sit in your shell history and in the process list.
 */

const rl = createInterface({ input: process.stdin, output: process.stdout });

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => rl.question(question, resolve));

const password = (await ask('Choose a password for SatzWerk: ')).trim();
rl.close();

if (password.length < 10) {
  console.error('\nThat is under 10 characters. This is the only thing standing between');
  console.error('the open internet and your learning data, so pick something longer.');
  process.exit(1);
}

console.log('\nSet these two variables where you host the app.');
console.log('Keep them secret, and do not commit them.\n');
console.log(`SATZWERK_PASSWORD_HASH=${hashPassword(password)}`);
console.log(`SATZWERK_SESSION_SECRET=${randomBytes(32).toString('hex')}`);
console.log('\nThe session secret is random: changing it signs everyone out, which');
console.log('is how you revoke access if you ever need to.');
