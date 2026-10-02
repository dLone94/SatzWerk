import { defineLevel } from './definition.ts';
import { A2_U1_PATTERNS, A2_UNIT_1 } from '../a2/unit1.ts';
import { A2_U2_PATTERNS, A2_UNIT_2 } from '../a2/unit2.ts';
import { A2_U3_PATTERNS, A2_UNIT_3 } from '../a2/unit3.ts';
import { A2_U4_PATTERNS, A2_UNIT_4 } from '../a2/unit4.ts';
import { A2_U5_PATTERNS, A2_UNIT_5 } from '../a2/unit5.ts';
import { A2_LEVEL_CHECKPOINT } from '../a2/levelCheckpoint.ts';

export const LEVEL = defineLevel('a2', [A2_UNIT_1, A2_UNIT_2, A2_UNIT_3, A2_UNIT_4, A2_UNIT_5], A2_LEVEL_CHECKPOINT);
export const PATTERNS = [...A2_U1_PATTERNS, ...A2_U2_PATTERNS, ...A2_U3_PATTERNS, ...A2_U4_PATTERNS, ...A2_U5_PATTERNS];
