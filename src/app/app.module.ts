import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule }     from './app-routing.module';
import { AppComponent } from './app.component';

import { AboutComponent } from './pages/about/index';
import { AlertComponent } from './components/alert/index';
import { AuthGuard } from './guards/index';
import { ContactUsComponent } from './pages/contactUs/index';
import { FooterComponent } from './components/footer/index';
import { FormsComponent } from './components/forms/index';
import { HomeComponent } from './pages/home/index';
import { LoginModalComponent } from './components/login/index';
import { NavbarComponent } from './components/navbar/index';
import { SearchCriteriaComponent } from './components/search/index';
import { SignupModalComponent } from './components/signup/index';

import {
    ListingComponent,
    ListingContainerComponent,
    ListingDetailComponent
} from './components/listing/index';

import {
    AlertService,
    FavouritesService,
    ListingService,
    LoginService,
    NavbarService,
    SignupService
} from './services/index';

import {
    FavouriteHelper,
    ListingHelper,
    ValidationHelper
} from './helpers/index';

import {
    ConvertNumberPipe,
    OrderByPipe
} from './pipes/index';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        AboutComponent,
        AlertComponent,
        ContactUsComponent,
        FooterComponent,
        FormsComponent,
        HomeComponent,
        ListingComponent,
        ListingContainerComponent,
        ListingDetailComponent,
        LoginModalComponent,
        NavbarComponent,
        SearchCriteriaComponent,
        SignupModalComponent,
        ConvertNumberPipe,
        OrderByPipe
    ],
    providers: [
        AlertService,
        AuthGuard,
        FavouritesService,
        LoginService,
        ListingService,
        NavbarService,
        SignupService,
        FavouriteHelper,
        ListingHelper,
        ValidationHelper
    ],
    bootstrap: [ AppComponent ]
})

export class AppModule { }
