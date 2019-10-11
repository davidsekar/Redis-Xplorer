import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StringEditorComponent } from './string-editor/string-editor.component';
import { HomeComponent } from './home/home.component';
import { ServerInfoComponent } from './server-info/server-info.component';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { GlobalService } from './global.service';
import { MessagingService } from './messaging.service';
import { FormsModule } from '@angular/forms';
import { ListComponent, ListEditComponent, ListService } from './list';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    StringEditorComponent,
    ServerInfoComponent,
    ListComponent,
    ListEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatGridListModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule
  ],
  providers: [
    GlobalService,
    MessagingService,
    ListService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
