import { defineLevel } from './definition.ts';
import { PRE_A1_PATTERNS, PRE_A1_UNIT_2 } from '../pre-a1/unit2.ts';
import { PRE_A1_U3_PATTERNS, PRE_A1_UNIT_3 } from '../pre-a1/unit3.ts';
import { PRE_A1_U4_PATTERNS, PRE_A1_UNIT_4 } from '../pre-a1/unit4.ts';
import { PRE_A1_U5_PATTERNS, PRE_A1_UNIT_5 } from '../pre-a1/unit5.ts';
import { PRE_A1_U6_PATTERNS, PRE_A1_UNIT_6 } from '../pre-a1/unit6.ts';
import { PRE_A1_LEVEL_CHECKPOINT } from '../pre-a1/levelCheckpoint.ts';
import { PRE_A1_UNIT_1 } from '../pre-a1/unit1.ts';

export const LEVEL = defineLevel('pre-a1', [PRE_A1_UNIT_1, PRE_A1_UNIT_2, PRE_A1_UNIT_3, PRE_A1_UNIT_4, PRE_A1_UNIT_5, PRE_A1_UNIT_6], PRE_A1_LEVEL_CHECKPOINT);
export const PATTERNS = [...PRE_A1_PATTERNS, ...PRE_A1_U3_PATTERNS, ...PRE_A1_U4_PATTERNS, ...PRE_A1_U5_PATTERNS, ...PRE_A1_U6_PATTERNS];
