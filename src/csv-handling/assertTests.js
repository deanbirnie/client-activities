import assert from 'assert';
import { calcDueDate } from './dueDateCalc.js';

// Assertions for testing
assert.strictEqual(calcDueDate("20210601T0830", 1), "20210601T0930", "Calculation error for Start Date: 1 June 2021 08:30, Duration: 1 hour");
assert.strictEqual(calcDueDate("20210601T0900", 8), "20210602T0930", "Calculation error for Start Date: 1 June 2021 09:00, Duration: 8 hours");
assert.strictEqual(calcDueDate("20210604T1500", 2), "20210607T0930", "Calculation error for Start Date: 4 June 2021 15:00, Duration: 2 hours");
assert.strictEqual(calcDueDate("20210426T0900", 3), "20210426T1200", "Calculation error for Start Date: 4 June 2021 15:00, Duration: 2 hours");
assert.strictEqual(calcDueDate("20210427T0830", 4), "20210427T1230", "Calculation error for Start Date: 4 June 2021 15:00, Duration: 2 hours");
assert.strictEqual(calcDueDate("20210428T1530", 4), "20210429T1200", "Calculation error for Start Date: 4 June 2021 15:00, Duration: 2 hours");
assert.strictEqual(calcDueDate("20210429T1330", 8), "20210430T1400", "Calculation error for Start Date: 4 June 2021 15:00, Duration: 2 hours");
assert.strictEqual(calcDueDate("20210430T1225", 18), "20210504T1525", "Calculation error for Start Date: 4 June 2021 15:00, Duration: 2 hours");

