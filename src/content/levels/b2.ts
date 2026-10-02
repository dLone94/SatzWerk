import { defineLevel } from './definition.ts';
import { B2_U1_PATTERNS, B2_UNIT_1 } from '../b2/unit1.ts';
import { B2_U2_PATTERNS, B2_UNIT_2 } from '../b2/unit2.ts';
import { B2_U3_PATTERNS, B2_UNIT_3 } from '../b2/unit3.ts';
import { B2_U4_PATTERNS, B2_UNIT_4 } from '../b2/unit4.ts';
import { B2_U5_PATTERNS, B2_UNIT_5 } from '../b2/unit5.ts';
import { B2_LEVEL_CHECKPOINT } from '../b2/levelCheckpoint.ts';

export const LEVEL = defineLevel('b2', [B2_UNIT_1, B2_UNIT_2, B2_UNIT_3, B2_UNIT_4, B2_UNIT_5], B2_LEVEL_CHECKPOINT);
export const PATTERNS = [...B2_U1_PATTERNS, ...B2_U2_PATTERNS, ...B2_U3_PATTERNS, ...B2_U4_PATTERNS, ...B2_U5_PATTERNS];
