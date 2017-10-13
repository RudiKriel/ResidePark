import { Component, Input } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { config } from '../../../assets/scripts/config.js';
import { Listing } from '../../models/listing';
import { ValidationHelper } from '../../helpers/index';

@Component({
  selector: 'forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css']
})
export class FormsComponent {
    @Input() listing: Listing;
    public questionForm: FormGroup;
    private _headers: Headers;
    private _url: string;

    constructor(private _http: Http, private _validationHelper: ValidationHelper, private _fb: FormBuilder) {
        this._url = config.api + 'questionForm.php';

        this._headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'q=0.8;application/json;q=0.9'
        });

        this.questionForm = _fb.group({
            firstName: ['', Validators.compose([Validators.required, _validationHelper.nameValidator])],
            lastName: ['', Validators.compose([Validators.required, _validationHelper.nameValidator])],
            phone: ['', Validators.compose([Validators.required])],
            email: ['', Validators.compose([Validators.required, _validationHelper.emailValidator])],
            body: ['', Validators.compose([Validators.required])]
        });
    }

    sendEmail(email: any): void {
        var emailData = {
            firstName: email.firstName,
            lastName: email.lastName,
            phone: email.phone,
            email: email.email,
            question: email.body,
            mls_id: this.listing.mls_id,
            mls_num: this.listing.mls_num
        };

        let data = this.emailData(emailData);
        this._http.post(this._url, data, this._headers).map((response: Response) => response.json()).subscribe(response => alert(response));
    }

    private emailData(email: any) {
        let params: URLSearchParams = new URLSearchParams();

        for (var key in email) {
            if (email.hasOwnProperty(key)) {
                let val = email[key];
                params.set(key, val);
            }
        }

        return params;
    }
}
