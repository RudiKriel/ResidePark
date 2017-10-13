import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class ValidationHelper {
    constructor() {
    }

    emailValidator(control: any): {[key: string]: any} {
        let emailRegexp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        if (control.value && !emailRegexp.test(control.value)) {
            return {invalidUsername: true};
        }
    }

    nameValidator(control: any): {[key: string]: any} {
        let nameRegexp = /^[a-zA-Z\-]+$/;

        if (control.value && !nameRegexp.test(control.value)) {
            return {invalidName: true};
        }
    }

    matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
        return (group: any): {[key: string]: any} => {
            let password = group.controls[passwordKey];
            let confirmPassword = group.controls[confirmPasswordKey];

            if (password.value !== confirmPassword.value) {
                return {
                    mismatchedPasswords: true
                };
            }
        }
    }
}