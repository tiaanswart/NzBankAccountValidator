/**
 * @author       Tiaan Swart (tswart@deloitte.co.nz)
 * @date         2019-04-05
 * @description  nzBankAccountValidator
 *
 * CHANGE LOG
 * 2019-04-01 - Initial Setup of nzBankAccountValidator
 **/
// Lighting Web Component Imports
import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Bank account validation service
import * as ValidationService from 'c/nzBankAccountValidationService';

// Import the Bank Images
import NZBankImages from '@salesforce/resourceUrl/NZBankImages';

// Export the Lightning Web Component
export default class NzBankAccountValidator extends LightningElement {

    // Config
    @api strTitle;
    @api accountSeparator;
    @api sObject;
    @api bankField;
    @api branchField;
    @api accountField;
    @api suffixField;
    @api fullBankAccountField;
    @api bankNameField;
    @api suffixNameField;

    // Record props
    @api recordId;
    @api recordApi;
    @api recordApiBank;
    @track recordFields = [];
    @track record;
    @track error;
    @track bank;
    @track branch;
    @track account;
    @track suffix;

    // Track changes to our main properties that will need to be binded to HTML
    @track copyIcon = 'utility:copy_to_clipboard';
    @track isLoading = true;
    @track isSaving = false;
    @track showBranchInfo = false;

    // Validation response
    @track validationObj;

    // Web Component Init
    connectedCallback() {
        // Add the fields if we have any
        if (this.sObject) {
            if (this.bankField) this.recordFields.push(this.sObject + '.' + this.bankField);
            if (this.branchField) this.recordFields.push(this.sObject + '.' + this.branchField);
            if (this.accountField) this.recordFields.push(this.sObject + '.' + this.accountField);
            if (this.suffixField) this.recordFields.push(this.sObject + '.' + this.suffixField);
            if (this.fullBankAccountField) this.recordFields.push(this.sObject + '.' + this.fullBankAccountField);
            if (this.bankNameField) this.recordFields.push(this.sObject + '.' + this.bankNameField);
            if (this.suffixNameField) this.recordFields.push(this.sObject + '.' + this.suffixNameField);
        }
    }

    // Get the Record
    @wire(getRecord, { recordId: '$recordId', optionalFields: '$recordFields' })
    wiredRecord({ error, data }) {
        this.recordApi = 'wiredRecord';
        this.isLoading = true;
        if (data) {
            this.record = data;
            this.recordApi = data;
            if (this.sObject) {
                if (this.bankField) this.bank = getFieldValue(this.record, this.sObject + '.' + this.bankField);
                if (this.bankField) this.recordApiBank = getFieldValue(this.record, this.sObject + '.' + this.bankField);
                if (this.branchField) this.branch = getFieldValue(this.record, this.sObject + '.' + this.branchField);
                if (this.accountField) this.account = getFieldValue(this.record, this.sObject + '.' + this.accountField);
                if (this.suffixField) this.suffix = getFieldValue(this.record, this.sObject + '.' + this.suffixField);
            }
            this.error = undefined;
            // Always re-validate
            this.validate();
        } else if (error) {
            this.error = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.error = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.error = error.body.message;
            }
            this.bank = undefined;
            this.branch = undefined;
            this.account = undefined;
            this.suffix = undefined;
            console.error('getRecord error', this.error);
            this.recordApi = this.error;
        }
        this.isLoading = false;
    }

    // Show spinner error property
    get showSpinner() {
        return this.isLoading || this.isSaving;
    }

    // Has error property
    get hasError() {
        return !!this.error;
    }

    // Has changed property
    get hasChanged() {
        return this.record && this.sObject && (
            (this.bankField && this.bank !== getFieldValue(this.record, this.sObject + '.' + this.bankField)) ||
            (this.branchField && this.branch !== getFieldValue(this.record, this.sObject + '.' + this.branchField)) ||
            (this.accountField && this.account !== getFieldValue(this.record, this.sObject + '.' + this.accountField)) ||
            (this.suffixField && this.suffix !== getFieldValue(this.record, this.sObject + '.' + this.suffixField)) ||
            (this.fullBankAccountField && this.fullNZBankAccountNumber !== getFieldValue(this.record, this.sObject + '.' + this.fullBankAccountField)) ||
            (this.bankNameField && this.bankName !== getFieldValue(this.record, this.sObject + '.' + this.bankNameField)) ||
            (this.suffixNameField && this.accountTypeName !== getFieldValue(this.record, this.sObject + '.' + this.suffixNameField)));
    }

    //Check if we can save, we need fields
    get canSave() {
        return this.hasChanged && !!this.recordFields.length;
    }

    // Determine if we have a valid Bank Code / Number
    get isValidBank() {
        if (!this.validationObj || !Object.keys(this.validationObj).length) this.validate();
        return this.bank && this.bank.length === 2 && this.validationObj && this.validationObj.id;
    }

    // Determine if we have a valid Branch Code / Number
    get isValidBranch() {
        if (!this.validationObj || !Object.keys(this.validationObj).length) this.validate();
        return this.branch && this.branch.length === 4 && this.validationObj && this.validationObj.branch;
    }

    // Determine if we have a valid Account Code / Number
    get isValidAccount() {
        if (!this.validationObj || !Object.keys(this.validationObj).length) this.validate();
        return this.account && this.account.length >= 6 && this.validationObj && this.validationObj.base;
    }

    // Determine if we have a valid Bank Account Type (Suffix) Code / Number
    get isValidSuffix() {
        if (!this.validationObj || !Object.keys(this.validationObj).length) this.validate();
        return this.suffix && this.suffix.length >= 2 && this.validationObj && this.validationObj.suffix;
    }

    // Determine if the entire account number is valid
    get isValidNZBankAccount() {
        if (!this.validationObj || !Object.keys(this.validationObj).length) this.validate();
        return this.validationObj ? Object.keys(this.validationObj).every((k) => { return this.validationObj[k] }) : false;
    }

    // Show a UI Message
    showToastEvent(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }

    // Use validation service
    validate() {
        const validationResponse = ValidationService.validate(this.fullNZBankAccountNumber);
        const self = this;
        // Handle Promise and Non-Promise responses (Testing)
        Promise.resolve(validationResponse).then(function(resp) {
            self.validationObj = resp;
        }).catch(err => console.error(err));
    }

    // Get the NZ Bank Object
    getBankObj() {
        if (!this.validationObj || !Object.keys(this.validationObj).length) this.validate();
        return this.validationObj ? this.validationObj.idData : null;
    }

    // Get the Bank image
    get bankImg() {
        return this.isValidBank ? `${NZBankImages}/NZBankImages/${this.bank}.png` : null;
    }

    // Get the classes with an error class if invalid
    get bankClasses() {
        return 'slds-form-element' + (this.bank && this.bank.length && !this.isValidBank ? ' slds-has-error' : '')
    }

    // Get the classes with an error class if invalid
    get branchClasses() {
        return 'slds-form-element' + (this.branch && this.branch.length && !this.isValidBranch ? ' slds-has-error' : '')
    }

    // Get the classes with an error class if invalid
    get accountClasses() {
        return 'slds-form-element' + (this.account && this.account.length && !this.isValidAccount ? ' slds-has-error' : '')
    }

    // Get the classes with an error class if invalid
    get suffixClasses() {
        return 'slds-form-element' + (this.suffix && this.suffix.length && !this.isValidSuffix ? ' slds-has-error' : '')
    }

    // Get the Bank Name to display in the footer
    get bankName() {
        const bankObj = this.isValidBank ? this.getBankObj() : null;
        return bankObj ? bankObj.Bank_Name : 'No bank found';
    }

    // Get the Account Type Name to display in the footer
    get accountTypeName() {
        const suffixObj = this.isValidSuffix ? this.validationObj.suffixData : null;
        return suffixObj ? suffixObj.name : 'No account type found';
    }

    // Get the Full Account Number
    get fullNZBankAccountNumber() {
        return this.accountSeparator ? [this.bank, this.branch, this.account, this.suffix].join(this.accountSeparator) : '';
    }

    // Make sure we can show branch details
    get canShowBranchInfo() {
        return this.isValidBank && this.isValidBranch && !this.showBranchInfo && !!this.validationObj;
    }

    // Get the Branch Name
    get branchName() {
        const bd = this.validationObj.branchData;
        return !!bd ? bd.Branch_Information : '';
    }

    // Get a well formatted address for a Branch
    get branchAddress() {
        const bd = this.validationObj.branchData;
        return !!bd ? [bd.Physical_Address1, bd.City, bd.Country_Name].filter(a => !!a).join(', ') : '';
    }

    // Get a well formatted address for a Branch
    get branchPhone() {
        const bd = this.validationObj.branchData;
        return !!bd ? [!!bd.Phone.indexOf('0800') ? bd.STD : '', bd.Phone].filter(a => !!a).join(' ') : '';
    }

    // Get a map marker for the Branch
    get canShowBranchAddressMap() {
        const bd = this.validationObj.branchData;
        return !!bd && !!bd.Physical_Address1 && !!bd.City;
    }

    // Get a map marker for the Branch
    get branchAddressMarker() {
        const bd = this.validationObj.branchData;
        return !!bd ? [
            {
                location: {
                    Street: bd.Physical_Address1,
                    City: bd.City,
                },
                title: bd.Branch_Information,
                description: this.validationObj.idData.Bank_Name,
            },
        ] : [];
    }

    // Handle focus
    focusBySelector(selector, focusOnly) {
        const elem = this.template.querySelector(selector);
        if (elem) focusOnly ? elem.focus() : elem.select();
    }

    // Handle input focus
    handleFocus(event) {
        // Get the name of the input we have focused on
        const field = event.target.name;
        // Now focus based on the name
        this.focusBySelector(`.${field}Input`);
    }

    // Handle input changes
    handleKeyUp(event) {
        // Get the name of the input we have changed
        const field = event.target.name;
        // Get the new value of the input
        let value = event.target.value;
        // Reset validation
        this.validationObj = {};
        // Now set the value based on the name
        if (field === 'bank') {
            if (this.bank !== value) {
                // Handle pasting a full bank account number 060998078516200 or 06-0998-0785162-00
                if (value.length >= 12) {
                    const fullAccObj = ValidationService.getPartsObject(value);
                    this.bank = fullAccObj.id;
                    this.branch = fullAccObj.branch;
                    this.account = fullAccObj.base;
                    this.suffix = fullAccObj.suffix;
                    if (this.isValidNZBankAccount) this.focusBySelector('.copyButton', true);
                } else {
                    this.bank = value;
                    if (this.isValidBank) this.focusBySelector('.branchInput');
                }
                this.showBranchInfo = false;
            }
        } else if (field === 'branch') {
            if (this.branch !== value) {
                this.branch = value;
                if (this.isValidBranch) this.focusBySelector('.accountInput');
                this.showBranchInfo = false;
            }
        } else if (field === 'account') {
            if (this.account !== value) {
                this.account = value;
                if (this.isValidAccount) this.focusBySelector('.suffixInput');
            }
        } else if (field === 'suffix') {
            if (this.suffix !== value) {
                this.suffix = value;
                if (this.isValidSuffix) this.focusBySelector('.copyButton', true);
            }
        }
    }

    // Handle the account copy
    handleCopy() {
        // If we have a valid account
        if (this.isValidNZBankAccount) {
            // Create a hidden input
            var hiddenInput = document.createElement("textarea");
            // Pass the bank account to it
            hiddenInput.value = this.fullNZBankAccountNumber;
            // Append the hiddenInput input to the body
            document.body.appendChild(hiddenInput);
            // select the content
            hiddenInput.select();
            // Execute the copy command
            document.execCommand("copy");
            // Remove the input from the body after we copied the account
            document.body.removeChild(hiddenInput);
            // change button icon after copy text
            this.copyIcon = 'utility:check';
            // Show toast
            this.showToastEvent('Copied', this.fullNZBankAccountNumber + ' has been copied to your clipboard', 'success');
            // set timeout to reset icon and label value after 700 milliseconds
            self = this;
            setTimeout(function() {
                self.copyIcon = 'utility:copy_to_clipboard';
            }, 2000);
        } else {
            this.showToastEvent('Copy Error', 'Not a valid NZ Bank Account number.', 'error');
        }
    }

    // Update the record if it was edited
    upsertBankDetails() {
        this.isSaving = true;
        let record = {
            fields: {
                Id: this.recordId
            },
        };
        if (this.bankField) record.fields[this.bankField] = this.bank;
        if (this.branchField) record.fields[this.branchField] = this.branch;
        if (this.accountField) record.fields[this.accountField] = this.account;
        if (this.suffixField) record.fields[this.suffixField] = this.suffix;
        if (this.fullBankAccountField) record.fields[this.fullBankAccountField] = this.fullNZBankAccountNumber;
        if (this.bankNameField) record.fields[this.bankNameField] = this.bankName;
        if (this.suffixNameField) record.fields[this.suffixNameField] = this.accountTypeName;
        updateRecord(record)
            .then(() => {
                this.isSaving = false;
                this.showToastEvent('Success', 'Record has been updated with the bank account details.', 'success');
            })
            .catch(error => {
                this.isSaving = false;
                this.error = 'Unknown error';
                // Get the standard error
                if (Array.isArray(error.body)) {
                    this.error = error.body.map(e => e.message).join(', ');
                } else if (typeof error.body.message === 'string') {
                    this.error = error.body.message;
                }
                // Get any field errors
                if (error.body.output && error.body.output.fieldErrors) {
                    const allFieldErrors = error.body.output.fieldErrors;
                    Object.keys(allFieldErrors).forEach((field) => {
                        allFieldErrors[field].forEach((error) => {
                            this.error += ' ' + Object.values(error).join(' - ');
                        });
                    });
                }
                console.error('upsertBankDetails error', this.error);
            });
    };

    toggleBranchInfo() {
        this.showBranchInfo = !this.showBranchInfo;
    };
}