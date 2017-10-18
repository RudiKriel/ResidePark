import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/Rx';

import { User } from '../../models/user';
import { FavouritesService, ListingService } from '../../services/index';
import { FavouriteHelper, ListingHelper } from '../../helpers/index';

@Component({
    selector: 'search-criteria',
    templateUrl: './search-criteria.component.html',
    styleUrls: ['./search-criteria.component.css']
})
export class SearchCriteriaComponent implements OnInit {
    @ViewChild('closeBtn') closeBtn: ElementRef;
    public user: User;
    public isRecentSearch: boolean;
    public searches$: Observable<any[]>;

    constructor(private _router: Router, private _favouritesService: FavouritesService, private _listingService: ListingService, private _favouriteHelper: FavouriteHelper, private _listingHelper: ListingHelper) {
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    ngOnInit(): void {
        if (this._router.url === '/searches') {
            this.isRecentSearch = false;
            let data = this._favouriteHelper.getData('searches', 'getSearches', this.user.id);

            this._favouritesService.getSearches(data);
        }
        else {
            this.isRecentSearch = true;
            let data = this._favouriteHelper.getData('searches', 'getRecentSearches', this.user.id);

            this._favouritesService.getSearches(data);
        }

        this.searches$ = this._favouritesService.searches$;
    }

    removeSearch(criteriaId: number): void {
        let data = {
            action: 'searches',
            subAction: 'removeSearch',
            criteriaId: criteriaId
        };

        if (this._router.url === '/searches') {
            let searchData = this._listingHelper.getParams(data);

            if (confirm('Are you sure you want to delete this listing from your favourites?')) {
                this._favouritesService.removeSearch(searchData).subscribe(() => {
                    let getData = this._favouriteHelper.getData('searches', 'getSearches', this.user.id);
                    this._favouritesService.getSearches(getData);
                });
            }
        }
    }

    toggleEmailOptOut(criteriaId: number): void {
        let data = {
            action: 'searches',
            subAction: 'emailOpt',
            criteriaId: criteriaId
        };

        let searchData = this._listingHelper.getParams(data);
        this._favouritesService.optSearchEmail(searchData);
    }

    search(criteria: any): void {
        let data = this.getSearchData(criteria);
        let listingData = this._listingHelper.getData(criteria.properties.split(','), 'propertySearch', '0', '12', [''], '', criteria.minPrice, criteria.maxPrice, criteria.beds, criteria.criteria);

        localStorage.setItem('searchData', JSON.stringify(data));

        this._listingService.getListings(listingData, this.user);
        this._router.navigateByUrl('/results');
    }

    private getSearchData(criteria: any) {
        let data = {
            action: 'propertySearch',
            search_property_type: criteria.properties.split(','),
            search_price_min: criteria.minPrice,
            search_price_max: criteria.maxPrice,
            search_beds: criteria.beds,
            qry: criteria.criteria
        };

        return data
    }
}
