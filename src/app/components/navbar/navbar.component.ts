import { Component, OnInit, Input, Inject, Injectable  } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import 'rxjs/Rx';
import * as jQuery from 'jquery';

import { User } from '../../models/user';
import { Listing } from '../../models/listing';
import { FavouritesService, ListingService, LoginService, NavbarService } from '../../services/index';
import { FavouriteHelper, ListingHelper } from '../../helpers/index';

@Component({
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    @Input() user: User;
    private alreadyChecked: boolean;
    public isLoggedIn$: Observable<boolean>;
    public favouritesChanged: boolean;
    public minPrice: string;
    public maxPrice: string;
    public bed: string;
    public data: any;
    public cities: any[];
    public minPrices: string[];
    public beds: string[];
    public propertyTypes: any[];

    constructor(@Inject(DOCUMENT) private _document: any, private _listingService: ListingService, private _navbarService: NavbarService, private _loginService: LoginService,
                private _favouritesService: FavouritesService, private _listingHelper: ListingHelper, private _favouriteHelper: FavouriteHelper,
                private _router: Router, private _elRef: ElementRef) {
        this.isLoggedIn$ = _loginService.isLoggedIn();
        this.minPrice = '';
        this.maxPrice = '';
        this.minPrices = ['50,000', '100,000', '150,000', '200,000', '250,000', '300,000', '400,000', '500,000'];
        this.beds = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
        this.propertyTypes = [
            { label: 'Houses', value: 'Single Family', checked: false },
            { label: 'Condos/Apartments', value: 'Condo', checked: false },
            { label: 'Lots/Land', value: 'Land', checked: false }
        ];
    }

    ngOnInit(): void {
        this.getCities();
    }

    ngAfterViewInit(): void {
        var script = this._document.createElement("script");
        script.type = "text/javascript";
        script.src = "assets/scripts/navbar.js";
        this._elRef.nativeElement.appendChild(script);
    }

    ngAfterViewChecked() {
        if(this.user != null && !this.alreadyChecked) {
            this.checkFavouritesChanged();
        }
    }

    getCities(): void {
        let data = this._listingHelper.getData([''], 'cityListSearch', '0', '', [''], '', '', '', '', '');

        this._navbarService.getCities(data).subscribe(cities => {
            let groups = cities.data.reduce(function(obj, item) {
                obj[item.city] = obj[item.city] || [];
                obj[item.city].push(item.area_name);
                return obj;
            }, {});

            let groupedCities = Object.keys(groups).map(function(key) {
                return {city: key, areas: groups[key]};
            });

            this.cities = groupedCities;
        });
    }

    search(qry: string): void {
        let data = this.getSearchData(qry);
        let searchData = this._listingHelper.getData(data.search_property_type, 'propertySearch', '0', '12', [''], '', data.search_price_min, data.search_price_max, data.search_beds, data.qry);

        localStorage.setItem('searchData', JSON.stringify(data));

        this._listingService.getListings(searchData, this.user);

        if (this._router.url !== '/results') {
            this._router.navigateByUrl('/results');
        }
    }

    saveCriteria(qry: string): void {
        let data = this._listingHelper.getParams(this.getSaveData(qry));
        this._navbarService.saveCriteria(data).map(res => res.json()).subscribe(res => {
            alert(res.msg);
            this.getSearchCriteria();
        });
    }

    getAreaDetails(area: string): void {
        let data = this.getAreaData(area);
        let searchData = this._listingHelper.getData([''], 'propertySearch', '0', '12', [''], data.search_area_name, '', '', '', '');

        localStorage.setItem('searchData', JSON.stringify(data));

        if (this._router.url !== '/area') {
            this._router.navigateByUrl('/area');
        }
        else {
            this._listingService.getListings(searchData, this.user);
        }
    }

    searchTerms(term: string, type: string): void {
        switch (type) {
            case ("beds"):
                this.bed = term;
                break;
        }
    }

    getFavourites(): void {
        let favouriteData = this._favouriteHelper.getData('getFavourites', this.user.id);

        this._favouritesService.getFavourites(favouriteData).subscribe(res => {
            let mls: string[] = [];

            for (let i = 0; i < res.favourites.length; i++) {
                mls.push(res.favourites[i].mls);
            }

            localStorage.setItem('favouriteData', mls.toString());
            this._router.navigateByUrl('/favourites');
        });
    }

    getSearches(): void {
        if (this._router.url !== '/searches') {
            this._router.navigateByUrl('/searches');
        }
    }

    getRecentSearches(): void {
        if (this._router.url !== '/recentSearches') {
            this._router.navigateByUrl('/recentSearches');
        }
    }

    checkFavouritesChanged(): void {
        let favouriteData = this._favouriteHelper.getData('getFavourites', this.user.id);

        this._favouritesService.hasFavouritesChanged(favouriteData).subscribe(res => {
            this.favouritesChanged = res.hasChanges;
            this.alreadyChecked = true;
        });
    }

    logout(): void {
        if(confirm('Are you sure you want to log out?')) {
            this._loginService.logout();
            this._router.navigate(['/']);

            this.alreadyChecked = false;
        }
    }

    private getSearchCriteria(): void {
        if (this._router.url === '/searches') {
            let favouriteData = this._favouriteHelper.getData('getSearches', this.user.id);
            this._favouritesService.getSearches(favouriteData);
        }
        if (this._router.url === '/recentSearches') {
            let favouriteData = this._favouriteHelper.getData('getRecentSearches', this.user.id);
            this._favouritesService.getSearches(favouriteData);
        }
    }

    private getSearchData(qry: string): any {
        let properties = this.propertyTypes.filter(property => property.checked).map(property => property.value);
        let minPrice = jQuery('#min-input').val().toString().replace(',', '');
        let maxPrice = jQuery('#max-input').val().toString().replace(',', '');

        if(typeof this.bed == 'undefined') {
            this.bed = '';
        }

        let data = {
            action: 'propertySearch',
            search_limit: '12',
            search_property_type: properties,
            search_price_min: minPrice,
            search_price_max: maxPrice,
            search_beds: this.bed,
            qry: qry
        };

        return data
    }

    private getSaveData(qry: string): any {
        let properties = this.propertyTypes.filter(property => property.checked).map(property => property.value);
        let minPrice = jQuery('#min-input').val().toString().replace(',', '');
        let maxPrice = jQuery('#max-input').val().toString().replace(',', '');

        if(typeof this.bed == 'undefined') {
            this.bed = '';
        }

        let data = {
            action: 'saveSearch',
            userId: this.user.id,
            beds: this.bed,
            minPrice: minPrice,
            maxPrice: maxPrice,
            qry: qry,
            properties: properties
        };

        return data;
    }

    private getAreaData(area: string): any {
        let data = {
            action: 'propertySearch',
            search_area_name: area
        };

        return data;
    }
}
