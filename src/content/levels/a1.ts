import { defineLevel } from './definition.ts';
import { A1_U1_PATTERNS, A1_UNIT_1 } from '../a1/unit1.ts';
import { A1_U2_PATTERNS, A1_UNIT_2 } from '../a1/unit2.ts';
import { A1_U3_PATTERNS, A1_UNIT_3 } from '../a1/unit3.ts';
import { A1_U4_PATTERNS, A1_UNIT_4 } from '../a1/unit4.ts';
import { A1_U5_PATTERNS, A1_UNIT_5 } from '../a1/unit5.ts';
import { A1_U6_PATTERNS, A1_UNIT_6 } from '../a1/unit6.ts';
import { A1_LEVEL_CHECKPOINT } from '../a1/levelCheckpoint.ts';

export const LEVEL = defineLevel('a1', [A1_UNIT_1, A1_UNIT_2, A1_UNIT_3, A1_UNIT_4, A1_UNIT_5, A1_UNIT_6], A1_LEVEL_CHECKPOINT);
export const PATTERNS = [...A1_U1_PATTERNS, ...A1_U2_PATTERNS, ...A1_U3_PATTERNS, ...A1_U4_PATTERNS, ...A1_U5_PATTERNS, ...A1_U6_PATTERNS];
