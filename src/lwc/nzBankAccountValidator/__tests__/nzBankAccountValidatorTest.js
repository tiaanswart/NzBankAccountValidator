/**
 * @author       Tiaan Swart (tswart@deloitte.co.nz)
 * @date         2019-04-05
 * @description  nzBankAccountValidatorTest
 *
 * CHANGE LOG
 * 2019-04-05 - Initial Setup of nzBankAccountValidatorTest
 **/
import {createElement} from 'lwc';
import { registerLdsTestWireAdapter } from '@salesforce/wire-service-jest-util';
import nzBankAccountValidator from 'c/nzBankAccountValidator';
import { getRecord } from 'lightning/uiRecordApi';

// Import mock data to send through the wire adapter.
const mockGetRecord = require('./data/getRecord.json');

describe('@wire nz bank account test', () => {
    // Register a test wire adapter.
    const getRecordWireAdapter = registerLdsTestWireAdapter(getRecord);

    // Disconnect the component to reset the adapter. It is also
    // a best practice to clean up after each test.
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays bank fields', () => {
        const element = createElement('c-nzBankAccountValidator', { is: nzBankAccountValidator });
        document.body.appendChild(element);
        getRecordWireAdapter.emit(mockGetRecord);

        // Resolve a promise to wait for a rerender of the new content.
        return Promise.resolve().then(() => {
            const bankInput = element.querySelector('.bankInput');
            expect(bankInput.textContent).toBe("01");

            const branchInput = element.querySelector('.branchInput');
            expect(branchInput.textContent).toBe("0001");

            const accountInput = element.querySelector('.accountInput');
            expect(accountInput.textContent).toBe("000001");

            const suffixInput = element.querySelector('.suffixInput');
            expect(suffixInput.textContent).toBe("00");
        });
    });
});