import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AlertService, SignupService } from '../../services/index';
import { ValidationHelper } from '../../helpers/index';

@Component({
    selector: 'signupModal',
    templateUrl: './signup-modal.component.html',
    styleUrls: ['./signup-modal.component.css']
})

export class SignupModalComponent {
    @ViewChild('closeBtn') closeBtn: ElementRef;
    public signupForm: FormGroup;

    constructor(private _signupService: SignupService, private _alertService: AlertService, private _validationHelper: ValidationHelper, private _fb: FormBuilder) {
        this.signupForm = _fb.group({
            username: ['', Validators.compose([Validators.required, _validationHelper.emailValidator])],
            firstName: ['', Validators.compose([Validators.required, _validationHelper.nameValidator])],
            lastName: ['', Validators.compose([Validators.required, _validationHelper.nameValidator])],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        }, { validator: _validationHelper.matchingPasswords('password', 'confirmPassword') });
    }

    signup(value: any): void {
        value['action'] = 'signup';

        this._signupService.signup(value).then(() => {
            let alert = this._alertService;
            let success = localStorage.getItem('success');

            if(success == 'true') {
                let that = this;
                let msg = localStorage.getItem('msg');
                alert.success(msg);

                setTimeout(function () {
                    alert.clearMessage();
                    that.closeModal();
                }, 2000);
            }
            else {
                let msg = localStorage.getItem('msg');
                alert.error(msg);

                setTimeout(function () {
                    alert.clearMessage();
                }, 2000);
            }
        });
    }

    private closeModal(): void {
        this.closeBtn.nativeElement.click();
    }
}