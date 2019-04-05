/**
 * @author       Tiaan Swart (tswart@deloitte.co.nz)
 * @date         2019-04-05
 * @description  nzBankAccountValidator
 *
 * CHANGE LOG
 * 2019-04-05 - Initial Setup of nzBankAccountValidator
 **/
import {LightningElement, api, wire, track} from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Map of NZ Banks with their codes and icons
const nzBanks = [
    {
        "bankNumber": "01",
        "bankName": "ANZ Bank New Zealand",
        "bankImg" : "https://www.anz.co.nz/etc/designs/commons/images/appicons/favicon-32x32.png"
    },
    {
        "bankNumber": "02",
        "bankName": "Bank of New Zealand",
        "bankImg" : "https://www.bnz.co.nz/favicons/favicon-32x32.png"
    },
    {
        "bankNumber": "03",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "04",
        "bankName": "ANZ Bank New Zealand",
        "bankImg" : "https://www.anz.co.nz/etc/designs/commons/images/appicons/favicon-32x32.png"
    },
    {
        "bankNumber": "05",
        "bankName": "China Construction Bank NZ Ltd",
        "bankImg" : "http://nz.ccb.com/favicon.ico"
    },
    {
        "bankNumber": "06",
        "bankName": "ANZ Bank New Zealand",
        "bankImg" : "https://www.anz.co.nz/etc/designs/commons/images/appicons/favicon-32x32.png"
    },
    {
        "bankNumber": "08",
        "bankName": "Bank of New Zealand",
        "bankImg" : "https://www.bnz.co.nz/favicons/favicon-32x32.png"
    },
    {
        "bankNumber": "10",
        "bankName": "Industrial and Commercial Bank of China (New Zealand) Ltd"
    },
    {
        "bankNumber": "11",
        "bankName": "ANZ Bank New Zealand",
        "bankImg" : "https://www.anz.co.nz/etc/designs/commons/images/appicons/favicon-32x32.png"
    },
    {
        "bankNumber": "12",
        "bankName": "ASB Bank",
        "bankImg" : "https://www.asb.co.nz/favicon.ico"
    },
    {
        "bankNumber": "13",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "14",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "15",
        "bankName": "TSB Bank",
        "bankImg" : "https://www.tsb.co.nz/sites/default/files/TSBBank_Favicon_0.png"
    },
    {
        "bankNumber": "16",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "17",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "18",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "19",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "20",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "21",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "22",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "23",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "24",
        "bankName": "ASB Bank",
        "bankImg" : "https://www.asb.co.nz/favicon.ico"
    },
    {
        "bankNumber": "25",
        "bankName": "ANZ Bank New Zealand",
        "bankImg" : "https://www.anz.co.nz/etc/designs/commons/images/appicons/favicon-32x32.png"
    },
    {
        "bankNumber": "27",
        "bankName": "Westpac",
        "bankImg" : "https://www.westpac.co.nz/favicon.ico"
    },
    {
        "bankNumber": "30",
        "bankName": "HSBC New Zealand",
        "bankImg" : "https://www.hsbc.co.nz/assets/BaseKit/images/favicon.ico"
    },
    {
        "bankNumber": "31",
        "bankName": "Citibank N.A.",
        "bankImg" : "https://www.citigroup.com/favicon.ico"
    },
    {
        "bankNumber": "38",
        "bankName": "Kiwibank",
        "bankImg" : "https://media.kiwibank.co.nz/static/favicon.ico"
    },
    {
        "bankNumber": "88",
        "bankName": "Bank of China NZ Ltd"
    }
];

// Map of NZ Bank Account Types
const nzBankAccountTypes = [
    {
        "name": "Cheque Account",
        "code": "00"
    },
    {
        "name": "Credit Card Account",
        "code": "40"
    },
    {
        "name": "Fixed Account",
        "code": "03"
    },
    {
        "name": "Number 2 Account",
        "code": "02"
    },
    {
        "name": "Savings Account",
        "code": "30"
    },
    {
        "name": "Term Deposit Account",
        "code": "81"
    },
    {
        "name": "Thrift Club Account",
        "code": "50"
    }
];

// Fields to use for integration
const fields = [
    'Account.Bank_Code__c',
    'Account.Bank_Branch_Code__c',
    'Account.Bank_Account_Code__c',
    'Account.Bank_Suffix_Code__c',
    'Account.Full_Bank_Account_Number__c',
];

// Export the Lightning Web Component
export default class NzBankAccountValidator extends LightningElement {
    // Config
    @api strTitle;
    @api accountSeparator;

    // Record props
    @api recordId;
    @track record;
    @track error;
    @track bank;
    @track branch;
    @track account;
    @track suffix;

    // Track changes to our main properties that will need to be binded to HTML
    @track copyIcon = 'utility:copy_to_clipboard';

    // Get the Record
    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (data) {
            this.record = data;
            this.bank = data.fields.Bank_Code__c.value;
            this.branch = data.fields.Bank_Branch_Code__c.value;
            this.account = data.fields.Bank_Account_Code__c.value;
            this.suffix = data.fields.Bank_Suffix_Code__c.value;
            this.error = undefined;
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
        }
    }

    // Has changed property
    get hasChanged() {
        return this.record && (
            this.bank !== this.record.fields.Bank_Code__c.value ||
            this.branch !== this.record.fields.Bank_Branch_Code__c.value ||
            this.account !== this.record.fields.Bank_Account_Code__c.value ||
            this.suffix !== this.record.fields.Bank_Suffix_Code__c.value
        ) && this.isValidNZBankAccount;
    }

    // Determine if we have a valid Bank Code / Number
    get isValidBank() {
        return this.bank && this.bank.length === 2 && nzBanks.filter(b => b.bankNumber === this.bank).length;
    }

    // Determine if we have a valid Branch Code / Number
    get isValidBranch() {
        return this.branch && this.branch.length === 4 && !isNaN(this.branch) && parseInt(this.branch) > 0;
    }

    // Determine if we have a valid Account Code / Number
    get isValidAccount() {
        return this.account && this.account.length === 6 && !isNaN(this.account) && parseInt(this.account) > 0;
    }

    // Determine if we have a valid Bank Account Type (Suffix) Code / Number
    get isValidSuffix() {
        return this.suffix && this.suffix.length === 2 && nzBankAccountTypes.filter(b => b.code === this.suffix).length;
    }

    // Determine if the entire account number is valid
    get isValidNZBankAccount() {
        return this.isValidBank && this.isValidBranch && this.isValidAccount && this.isValidSuffix;
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

    // Get the NZ Bank Object
    getBankObj() {
        const theBank = this.bank ? nzBanks.filter(b => b.bankNumber === this.bank) : null;
        return theBank;
    }

    // Determine if we have an image for this bank to display
    get hasBankImg() {
        return this.isValidBank && this.getBankObj()[0].bankImg;
    }

    // Get the Bank image
    get bankImg() {
        return this.isValidBank ? this.getBankObj()[0].bankImg : null;
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
        return this.isValidBank ? this.getBankObj()[0].bankName : 'No bank found';
    }

    // Get the Account Type Name to display in the footer
    get accountTypeName() {
        const theAccountType = this.suffix && this.isValidSuffix ? nzBankAccountTypes.filter(b => b.code === this.suffix) : null;
        return theAccountType && theAccountType.length ? theAccountType[0].name : 'No account type found';
    }

    // Get the Full Account Number
    get fullNZBankAccountNumber() {
        return this.isValidNZBankAccount ? [this.bank, this.branch, this.account, this.suffix].join(this.accountSeparator) : '';
    }

    // Handle focus
    focusBySelector(selector) {
        const elem = this.template.querySelector(selector);
        if (elem) elem.focus();
    }

    // Handle input changes
    handleKeyUp(event) {
        // Get the name of the input we have changed
        const field = event.target.name;
        // Get the new value of the input
        let value = event.target.value;
        // Now set the value based on the name
        if (field === 'bank') {
            if (this.bank !== value) {
                this.bank = value;
                if (this.isValidBank) this.focusBySelector('.branchInput');
            }
        } else if (field === 'branch') {
            if (this.branch !== value) {
                this.branch = value;
                if (this.isValidBranch) this.focusBySelector('.accountInput');
            }
        } else if (field === 'account') {
            if (this.account !== value) {
                this.account = value;
                if (this.isValidAccount) this.focusBySelector('.suffixInput');
            }
        } else if (field === 'suffix') {
            if (this.suffix !== value) {
                this.suffix = value;
                if (this.isValidSuffix) this.focusBySelector('.copyButton');
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
    updateRecord() {
        let record = {
            fields: {
                Id: this.recordId,
                Bank_Code__c: this.bank,
                Bank_Branch_Code__c: this.branch,
                Bank_Account_Code__c: this.account,
                Bank_Suffix_Code__c: this.suffix,
                Full_Bank_Account_Number__c: this.fullNZBankAccountNumber,
            },
        };
        updateRecord(record)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record has been updated',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                console.error('error', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error on save',
                        message: error.message.body,
                        variant: 'error',
                    }),
                );
            });
    };
}