import { Component, OnInit } from '@angular/core';

import { AlertService } from '../../services/index';

@Component({
    selector: 'alert',
    templateUrl: 'alert.component.html',
    styleUrls: ['./alert.component.css']
})

export class AlertComponent {
    message: string;

    constructor(private _alertService: AlertService) {}

    ngOnInit() {
        this._alertService.getMessage().subscribe(message => { this.message = message; });
    }
}