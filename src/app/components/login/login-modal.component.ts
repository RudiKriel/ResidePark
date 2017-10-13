import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AlertService, ListingService, LoginService } from '../../services/index';
import { ListingHelper, ValidationHelper } from '../../helpers/index';

@Component({
    selector: 'loginModal',
    templateUrl: './login-modal.component.html',
    styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
    @ViewChild('closeBtn') closeBtn: ElementRef;
    public loginForm: FormGroup;

    constructor(private _loginService: LoginService, private _alertService: AlertService, private _validationHelper: ValidationHelper,
                private _listingService: ListingService, private _listingHelper: ListingHelper, private _fb: FormBuilder) {
        this.loginForm = _fb.group({
            username: ['', Validators.compose([Validators.required, _validationHelper.emailValidator])],
            password: ['', Validators.required]
        });
    }

    login(value: any): void {
        this._loginService.login(value).then(()=> {
            let alert = this._alertService;
            let success = localStorage.getItem('success');
            let user = JSON.parse(localStorage.getItem('user'));
            let data = JSON.parse(localStorage.getItem('searchData'));

            if (success == 'true') {
                let searchData = this._listingHelper.getData(data.search_property_type, 'propertySearch', '0', '12', [''], data.search_area_name, data.search_price_min, data.search_price_max, data.search_beds, data.qry);

                this._listingService.getListings(searchData, user);
                this.closeModal();
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