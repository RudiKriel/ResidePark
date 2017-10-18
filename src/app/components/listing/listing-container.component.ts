import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import 'rxjs/Rx';
import * as jQuery from 'jquery';

import { User } from '../../models/user';
import { Listing } from '../../models/listing';
import { FavouritesService, ListingService } from '../../services/index';
import { FavouriteHelper, ListingHelper } from '../../helpers/index';

@Component({
    selector: 'listing-container',
    templateUrl: './listing-container.component.html',
    styleUrls: ['./listing-container.component.css']
})
export class ListingContainerComponent implements OnInit {
    @Input() user: User;
    private _searchOffset: number = 0;
    private _count: number = 0;
    public search: boolean;
    public isFavourite: boolean;
    public isDetailSearch: boolean;
    public isDesc: boolean;
    public sortOrder: string;
    public column: string;
    public filters: string[];
    public sorting: string[];
    public totalCount$: Observable<number>;
    public listings$: Observable<any[]>;

    constructor(private _favouritesService: FavouritesService, private _listingService: ListingService, private _favouriteHelper: FavouriteHelper,
                private _listingHelper: ListingHelper, private _router: Router, private _changeDetector: ChangeDetectorRef) {
        this.isDesc = false;
        this.sortOrder = 'Ascending';
        this.column = 'list_id';
        this.filters = ['Price', 'Square Ft', 'Beds'];
        this.sorting = ['Ascending', 'Descending'];
    }

    ngOnInit(): void {
        this.getListings();
    }

    ngAfterViewInit(): void {
        this._changeDetector.detectChanges();
        jQuery('.noListings').hide();
    }

    ngAfterViewChecked(): void {
        let totalCount = this.totalCount$;

        if (jQuery('.listingGrid').is(':visible')) {
            jQuery('.fa-spinner').hide();
            jQuery('.noListings').hide();
        }
        else if (!jQuery('.noListings').is(':visible')) {
            setTimeout(function () {
                totalCount.subscribe(l => {
                    if (l > 0) {
                        jQuery('.fa-spinner').show();
                        jQuery('.noListings').hide();
                    }
                    else {
                        jQuery('.fa-spinner').hide();
                        jQuery('.noListings').show();
                    }
                }).unsubscribe();
            }, 3000);
        }
    }

    getListings(): void {
        if (this._router.url === '/') {
            this.search = false;

            localStorage.setItem('searchData', JSON.stringify(this._listingHelper.getInitialData(['Single Family', 'Condo'], 'propertySearch', '0', '12', [''], 'Old Town', '800000', '2000000', '', '')));

            let data =  JSON.parse(localStorage.getItem('searchData'));
            let searchData = this._listingHelper.getData(data.search_property_type, 'propertySearch', '0', '12', [''], data.search_area_name, data.search_price_min, data.search_price_max, data.search_beds, data.qry);

            this._listingService.getListings(searchData, this.user);
        }
        else if (this._router.url === '/results') {
            this.search = true;

            let data = JSON.parse(localStorage.getItem('searchData'));
            let searchData = this._listingHelper.getData(data.search_property_type, 'propertySearch', '0', '12', [''], '', data.search_price_min, data.search_price_max, data.search_beds, data.qry);

            this._listingService.getListings(searchData, this.user);
        }
        else if (this._router.url === '/favourites') {
            this.isFavourite = true;
            this.getFavouriteListings();
        }
        else if (this._router.url === '/area' || this._router.url.includes('detail')) {
            this.search = true;
            this.isDetailSearch = true;

            let data = JSON.parse(localStorage.getItem('searchData'));
            let searchData = this._listingHelper.getData([''], 'propertySearch', '0', '12', [''], data.search_area_name, '', '', '', '');

            this._listingService.getListings(searchData, this.user);
        }

        this.listings$ = this._listingService.listings$;
        this.totalCount$ = this._listingService.listingCount$;
    }

    filter(filter: string): void {
        this.column = this.column.split('-').pop();
        this.column = filter === 'Square Ft' ? 'square_feet' : (!this.isDesc ? filter.toLowerCase() : '-' + filter.toLowerCase());

        this.sort(this.sortOrder);
    }

    sort(sort: string): void {
        this.isDesc = sort !== 'Ascending';
        this.sortOrder = sort;
        this.column = this.column.split('-').pop();
        this.column = !this.isDesc ? this.column : '-' + this.column;
    }

    loadMore(): void {
        let count = this._count++;
        this._searchOffset = 12 * count;
        let data = JSON.parse(localStorage.getItem('searchData'));
        let listingData = this._listingHelper.getData(data.search_property_type, 'propertySearch', this._searchOffset.toString(), '12', [''], data.search_area_name, data.search_price_min, data.search_price_max, data.search_beds, data.qry);

        listingData['loadMore'] = true;

        this._listingService.getListings(listingData, this.user);
    }

    private getFavouriteListings(): void {
        if (localStorage.getItem('favouriteData') !== null) {
            let mls = localStorage.getItem('favouriteData').split(",");
            let data = this._listingHelper.getData([''], 'propertySearch', '0', '12', mls, '', '', '', '', '');

            this._listingService.getListings(data, this.user);
        }
        else {
            let favouriteData = this._favouriteHelper.getData('favourites', 'getFavourites', this.user.id);

            this._favouritesService.getFavourites(favouriteData).subscribe(res => {
                let mls: string[] = [];

                for (let i = 0; i < res.favourites.length; i++) {
                    mls.push(res.favourites[i].mls);
                }

                let data = this._listingHelper.getData([''], 'propertySearch', '0', '12', mls, '', '', '', '', '');
                this._listingService.getListings(data, this.user);
            });
        }
    }
}
