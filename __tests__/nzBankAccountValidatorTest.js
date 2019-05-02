/**
 * @author       Tiaan Swart (tswart@deloitte.co.nz)
 * @date         2019-04-05
 * @description  nzBankAccountValidatorTest
 *
 * CHANGE LOG
 * 2019-04-05 - Initial Setup of nzBankAccountValidatorTest
 **/
import { createElement } from 'lwc';
import { registerLdsTestWireAdapter } from '@salesforce/wire-service-jest-util';
import nzBankAccountValidator from 'c/nzBankAccountValidator';
import { getRecord } from 'lightning/uiRecordApi';

// Import mock data to send through the wire adapter.
const mockGetRecord = require('./data/getRecord.json');

// Set the validation service to be mocked
jest.mock('c/nzBankAccountValidationService', () => ({
    validate: () => ({
        'partsObjectValid': true,
        'id': true,
        'idData': {"Bank_Name": "ANZ Bank New Zealand"},
        'branch': true,
        'branchData': {
            "Branch_Information": "ANZ Retail 1",
            "City": "Wellington",
            "Physical_Address1": "215-229 Lambton Quay",
            "Post_Code": "6001",
            "Country_Name": "New Zealand",
            "STD": "(04)",
            "Phone": "0800 269 296",
        },
        'base': true,
        'suffix': true,
        'suffixData': {"name": "Cheque Account", "code": "0000"},
    })
}));

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

    it('does not display bank fields', () => {
        // Create the validator component
        const element = createElement('c-nzBankAccountValidator', { is: nzBankAccountValidator });
        document.body.appendChild(element);
        getRecordWireAdapter.emit(mockGetRecord);

        // Resolve a promise to wait for a rerender of the new content.
        return Promise.resolve().then(() => {
            // Finished Loading
            const loadingSpinner = element.shadowRoot.querySelector('.loadingSpinner');
            expect(loadingSpinner).toBeDefined();
            expect(loadingSpinner).toBeNull();

            // No Error
            const error = element.shadowRoot.querySelector('.slds-theme_error');
            expect(error).toBeDefined();
            expect(error).toBeNull();

            const bankInput = element.shadowRoot.querySelector('.bankInput');
            expect(bankInput).toBeDefined();
            expect(bankInput).not.toBeNull();
            expect(bankInput.textContent).toBe("");

            const branchInput = element.shadowRoot.querySelector('.branchInput');
            expect(branchInput).toBeDefined();
            expect(branchInput).not.toBeNull();
            expect(branchInput.textContent).toBe("");

            const accountInput = element.shadowRoot.querySelector('.accountInput');
            expect(accountInput).toBeDefined();
            expect(accountInput).not.toBeNull();
            expect(accountInput.textContent).toBe("");

            const suffixInput = element.shadowRoot.querySelector('.suffixInput');
            expect(suffixInput).toBeDefined();
            expect(suffixInput).not.toBeNull();
            expect(suffixInput.textContent).toBe("");
        });
    });

    it('displays bank fields', () => {
        // Create the validator component
        const element = createElement('c-nzBankAccountValidator', { is: nzBankAccountValidator });
        element.recordId = '0016F0000353JsDQAU';
        element.sObject = 'Account';
        element.bankField = 'Bank_Code__c';
        element.branchField = 'Bank_Branch_Code__c';
        element.accountField = 'Bank_Account_Code__c';
        element.suffixField = 'Bank_Suffix_Code__c';
        element.fullBankAccountField = 'Full_Bank_Account_Number__c';
        element.bankNameField = 'Bank_Name__c';
        element.suffixNameField = 'Account_Type__c';
        document.body.appendChild(element);
        getRecordWireAdapter.emit(mockGetRecord);

        setTimeout(() => {
            // Resolve a promise to wait for a rerender of the new content.
            return Promise.resolve().then(() => {
                // Finished Loading
                const loadingSpinner = element.shadowRoot.querySelector('.loadingSpinner');
                expect(loadingSpinner).toBeDefined();
                expect(loadingSpinner).toBeNull();

                // No Error
                const error = element.shadowRoot.querySelector('.slds-theme_error');
                expect(error).toBeDefined();
                expect(error).toBeNull();

                const bankInput = element.shadowRoot.querySelector('.bankInput');
                expect(bankInput).toBeDefined();
                expect(bankInput).not.toBeNull();
                expect(bankInput.textContent).toBe("01");

                const branchInput = element.shadowRoot.querySelector('.branchInput');
                expect(branchInput).toBeDefined();
                expect(branchInput).not.toBeNull();
                expect(branchInput.textContent).toBe("0001");

                const accountInput = element.shadowRoot.querySelector('.accountInput');
                expect(accountInput).toBeDefined();
                expect(accountInput).not.toBeNull();
                expect(accountInput.textContent).toBe("000001");

                const suffixInput = element.shadowRoot.querySelector('.suffixInput');
                expect(suffixInput).toBeDefined();
                expect(suffixInput).not.toBeNull();
                expect(suffixInput.textContent).toBe("00");
            });
        }, 5000);
    });
});