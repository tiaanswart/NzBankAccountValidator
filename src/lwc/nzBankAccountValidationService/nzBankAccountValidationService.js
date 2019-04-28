/**
 * @author       Tiaan Swart (tswart@deloitte.co.nz)
 * @date         2019-04-17
 * @description  NZ Bank Account Validation Service
 *
 * CHANGE LOG
 * 2019-04-17 - Initial Setup of nzbankaccountvalidationservice
 *
 * Original version:
 * https://github.com/wytlytningNZ/NZ-Bank-Account-Validator
 **/
// Import the Banks JSON
import NZBankRegister from '@salesforce/resourceUrl/NZBankRegister';
let nzBanksJSON;

// Array of NZ Bank Account Types
const nzBankAccountTypes = [
    {
        "name": "Cheque Account",
        "code": "0000"
    },
    {
        "name": "Credit Card Account",
        "code": "0040"
    },
    {
        "name": "Fixed Account",
        "code": "0003"
    },
    {
        "name": "Number 2 Account",
        "code": "0002"
    },
    {
        "name": "Savings Account",
        "code": "0030"
    },
    {
        "name": "Term Deposit Account",
        "code": "0081"
    },
    {
        "name": "Thrift Club Account",
        "code": "0050"
    }
];

const partConstants = {
    id: 'id',
    branch: 'branch',
    base: 'base',
    suffix: 'suffix'
};

const partIndexes = {
    [partConstants.id]: 0,
    [partConstants.branch]: 1,
    [partConstants.base]: 2,
    [partConstants.suffix]: 3
};

const partMaxLengths = {
    [partConstants.id]: 2,
    [partConstants.branch]: 4,
    [partConstants.base]: 8,
    [partConstants.suffix]: 4
};

const allBankBranchData = [
    {
        key: 'AB',
        branches: {

            '01': [
                [1, 999],
                [1100, 1199],
                [1800, 1899]
            ],

            '02': [
                [1, 999],
                [1200, 1299]
            ],

            '03': [
                [1, 999],
                [1300, 1399],
                [1500, 1599],
                [1700, 1799],
                [1900, 1999]
            ],

            '06': [
                [1, 999],
                [1400, 1499]
            ],

            '11': [
                [5000, 6499],
                [6600, 8999]
            ],

            '12': [
                [3000, 3299],
                [3400, 3499],
                [3600, 3699]
            ],

            '13': [
                [4900, 4999]
            ],

            '14': [
                [4700, 4799]
            ],

            '15': [
                [3900, 3999]
            ],

            '16': [
                [4400, 4499]
            ],

            '17': [
                [3300, 3399]
            ],

            '18': [
                [3500, 3599]
            ],

            '19': [
                [4600, 4649]
            ],

            '20': [
                [4100, 4199]
            ],

            '21': [
                [4800, 4899]
            ],

            '22': [
                [4000, 4049]
            ],

            '23': [
                [3700, 3799]
            ],

            '24': [
                [4300, 4349]
            ],

            '27': [
                [3800, 3849]
            ],

            '30': [
                [2900, 2949]
            ],

            '35': [
                [2400, 2499]
            ],

            '38': [
                [9000, 9499]
            ]
        }
    },

    {
        key: 'D',
        branches: {
            '08': [
                [6500, 6599]
            ]
        }
    },

    {
        key: 'E',
        branches: {
            '09': [
                [0, 0]
            ]
        }
    },

    {
        key: 'F',
        branches: {
            '25': [
                [2500, 2599]
            ],

            '33': [
                [6700, 6799]
            ]
        }
    },

    {
        key: 'G',
        branches: {
            '26': [
                [2600, 2699]
            ],

            '28': [
                [2100, 2149]
            ],

            '29': [
                [2150, 2299]
            ]
        }
    },

    {
        key: 'X',
        branches: {
            '31': [
                [2800, 2849]
            ]
        }
    }

];

const allBankChecksums = {
    A: {
        weighting: [0,0,  6,3,7,9,  0,0,10,5,8,4,2,1,  0,0,0,0],
        modulo: 11
    },

    B: {
        weighting: [0,0,  0,0,0,0,  0,0,10,5,8,4,2,1,  0,0,0,0],
        modulo: 11
    },

    C: {
        weighting: [3, 7,  0,0,0,0,  9,1,10,5,3,4,2,1,  0,0,0,0],
        modulo: 11
    },

    D: {
        weighting: [0, 0,  0,0,0,0,  0,7,6,5,4,3,2,1,  0,0,0,0],
        modulo: 11
    },

    E: {
        weighting: [0, 0,  0,0,0,0,  0,0,0,0,5,4,3,2,  0,0,0,1],
        modulo: 11,
        specialCase: true
    },

    F: {
        weighting: [0, 0,  0,0,0,0,  0,1,7,3,1,7,3,1,  0,0,0,0],
        modulo: 10
    },

    G: {
        weighting: [0, 0,  0,0,0,0,  0,1,3,7,1,3,7,1,  0,3,7,1],
        modulo: 10,
        specialCase: true
    },

    X: {
        weighting: [0, 0,  0,0,0,0,  0,0,0,0,0,0,0,0,  0,0,0,0],
        modulo: 1
    },
};

const isString = x => x === x + '';

const isNumbersOnly = x => /^[0-9]+$/.test(x);

const padLeft = (input, length, token = '0') => Array(length - String(input).length + 1).join(token) + input;

const inRange = (start, value, end) => value >= start && value <= end;

const inRanges = (value, ranges = []) => {
    return ranges.reduce((bool, range) => {
        const [ start, end ] = range;

        return bool || inRange(start, value, end);
    }, false);
};

const sumChars = int => {
    return (int + '').split('').reduce((acc, num) => {
        return acc + (num * 1);
    }, 0);
};

const getPaddedAccountArray = (partsObj) => {
    return Object.keys(partsObj).reduce((a, k) => {
        const paddedValue = padLeft(partsObj[k], partMaxLengths[k]);
        const splitValues = paddedValue.split('');

        return a.concat(splitValues);
    }, []);
};

export default {

    __isPartsObject(obj = {}) {
        if (typeof obj !== 'object') return false;
        const inputsKeys = Object.keys(obj);
        const requiredKeys = Object.keys(partConstants);
        const filteredKeys = requiredKeys.filter(k => inputsKeys.includes(k));

        return requiredKeys.length === filteredKeys.length;
    },

    __splitString(str = '') {
        const parts = isString(str) ? str.split(/[^0-9]/) : [];

        // If the input string had no delimiters, and its length is
        // long enough, manually forge an array.
        if (parts.length === 1) {
            parts[0] = str.slice(0, 2);
            parts[1] = str.slice(2, 5);
            parts[2] = str.slice(5, 12);
            parts[3] = str.slice(12);
        }

        return parts.filter(i => i.length);
    },

    getPartsObject(input) {
        if (this.__isPartsObject(input)) {
            return input;
        }

        if (!isString(input)) {
            return {};
        }

        const parts = this.__splitString(input);

        return {
            id: parts[partIndexes.id],
            branch: parts[partIndexes.branch],
            base: parts[partIndexes.base],
            suffix: parts[partIndexes.suffix]
        };
    },

    __partsObjectValid(obj = {}) {
        const keys = Object.keys(obj);

        if (keys.length !== 4) {
            return false;
        }

        return keys.reduce((isValid, key) => {
            const value = obj[key];
            const onlyNumbers = isNumbersOnly(value);
            const withinMaxLength = isString(value) && (value.length <= partMaxLengths[key]);
            const valueValid = onlyNumbers && withinMaxLength;

            return isValid && valueValid;
        }, true);
    },

    __getBanksJSON () {
        // Get the Banks JSON
        return fetch(`${NZBankRegister}/banks.json`)
            .then(res => res.json())
            .then((out) => {
                nzBanksJSON = out;
            }).catch(err => console.error(err));
    },

    async validate(input) {

        if (!nzBanksJSON) await this.__getBanksJSON();

        // Setup our default validation object
        const partValidation = {
            partsObjectValid: false,
            [partConstants.id]: false,
            [partConstants.id + 'Data']: undefined,
            [partConstants.branch]: false,
            [partConstants.branch + 'Data']: undefined,
            [partConstants.base]: false,
            [partConstants.suffix]: false,
            [partConstants.suffix + 'Data']: undefined,
        };

        // Get the Parts Object
        const partsObject = this.getPartsObject(input);

        // Make sure we have a valid parts object
        partValidation.partsObjectValid = this.__partsObjectValid(partsObject);

        if (!partValidation.partsObjectValid) {
            return partValidation;
        }

        const { id, branch, base, suffix } = partsObject;

        // VALIDATION - STEP 1

        partValidation[partConstants.id + 'Data'] = this.__getBankData(id);
        partValidation[partConstants.id] = !!partValidation[partConstants.id + 'Data'];

        partValidation[partConstants.branch + 'Data'] = this.__getBankBranchData(id, branch);
        partValidation[partConstants.branch] = !!partValidation[partConstants.branch + 'Data'];

        const bankBranchRangeData = this.__getBankBranchRangeData(id, branch);
        const algorithm = this.__getChecksum(bankBranchRangeData, base);

        // VALIDATION - STEP 2
        if (algorithm) {

            const { weighting, modulo, specialCase } = algorithm;
            const earlyExit = !specialCase;

            const result = getPaddedAccountArray(partsObject).reduce((result, num, idx) => {
                const multiplied = num * weighting[idx];

                if (earlyExit || multiplied < 10) {
                    return result + multiplied;
                }

                const summed = sumChars(multiplied);
                const summedTwice = sumChars(summed);
                const final = summed < 10 ? summed : summedTwice;

                return result + final;
            }, 0);

            partValidation[partConstants.base] = result % modulo === 0;

        }

        partValidation[partConstants.suffix + 'Data'] = this.__getSuffixData(suffix);
        partValidation[partConstants.suffix] = !!partValidation.suffixData;

        // Final modulo test
        return partValidation;
    },

    __getBankData(id) {
        const paddedId = padLeft(id, partMaxLengths.id);
        return nzBanksJSON[paddedId];
    },

    __getBankBranchData(id, branch) {
        const paddedId = padLeft(id, partMaxLengths.id);
        const paddedBranch = padLeft(branch, partMaxLengths.branch);
        return nzBanksJSON[paddedId] ? nzBanksJSON[paddedId]['Branches'][paddedBranch] : null;
    },

    __getBankBranchRangeData(id, branch) {
        const paddedId = padLeft(id, partMaxLengths.id);

        return allBankBranchData.find(r => {
            const ranges = r.branches[paddedId];

            return ranges && inRanges(branch, ranges);
        });
    },

    __getChecksum(bankData, base) {
        if (!bankData || !base) return null;

        let { key } = bankData;

        if (key === 'AB') {
            key = (parseInt(base, 10) < 990000) ? 'A' : 'B';
        }

        return allBankChecksums[key];
    },

    __getSuffixData(suffix) {
        const paddedSuffix = padLeft(suffix, partMaxLengths.suffix);
        return nzBankAccountTypes.filter(b => b.code === paddedSuffix)[0];
    },
};