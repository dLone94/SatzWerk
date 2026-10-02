import { defineLevel } from './definition.ts';
import { B1_U1_PATTERNS, B1_UNIT_1 } from '../b1/unit1.ts';
import { B1_U2_PATTERNS, B1_UNIT_2 } from '../b1/unit2.ts';
import { B1_U3_PATTERNS, B1_UNIT_3 } from '../b1/unit3.ts';
import { B1_U4_PATTERNS, B1_UNIT_4 } from '../b1/unit4.ts';
import { B1_U5_PATTERNS, B1_UNIT_5 } from '../b1/unit5.ts';
import { B1_U6_PATTERNS, B1_UNIT_6 } from '../b1/unit6.ts';
import { B1_LEVEL_CHECKPOINT } from '../b1/levelCheckpoint.ts';

export const LEVEL = defineLevel('b1', [B1_UNIT_1, B1_UNIT_2, B1_UNIT_3, B1_UNIT_4, B1_UNIT_5, B1_UNIT_6], B1_LEVEL_CHECKPOINT);
export const PATTERNS = [...B1_U1_PATTERNS, ...B1_U2_PATTERNS, ...B1_U3_PATTERNS, ...B1_U4_PATTERNS, ...B1_U5_PATTERNS, ...B1_U6_PATTERNS];
